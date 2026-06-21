"use client";

import { useState, useEffect, useMemo, type ChangeEvent } from "react";
import { useUser, useAuth, useFirestore, useFirebaseApp, useCollection } from "@/firebase";
import { useDoc } from "@/firebase/firestore/use-doc";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  User, Mail, Zap, LogOut, Crown, Bell, Globe, Coins,
  Lock, Smartphone, Calendar, Camera, AtSign, Phone, Eye, EyeOff, Save, Loader2,
} from "lucide-react";
import { signOut, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { doc, setDoc, collection, query, DocumentReference } from "firebase/firestore";
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from "firebase/storage";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Transaction, BudgetGoal } from "@/app/lib/types";

interface UserProfile {
  username: string;
  phoneCode: string;
  phoneNumber: string;
}

export default function ProfilePage() {
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const firebaseApp = useFirebaseApp();
  const router = useRouter();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewURL, setAvatarPreviewURL] = useState("");
  const [username, setUsername] = useState("");
  const [phoneCode, setPhoneCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const uid = user?.uid;
  const storage = useMemo(
    () => getStorage(firebaseApp, `gs://${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}`),
    [firebaseApp]
  );

  const profileRef = useMemo(
    () => (uid ? doc(db, "users", uid, "profile", "info") as DocumentReference<UserProfile> : null),
    [db, uid]
  );
  const transactionsQuery = useMemo(
    () => (uid ? query(collection(db, "users", uid, "transactions")) : null),
    [db, uid]
  );
  const goalsQuery = useMemo(
    () => (uid ? query(collection(db, "users", uid, "goals")) : null),
    [db, uid]
  );

  const { data: profileData } = useDoc<UserProfile>(profileRef);
  const { data: transactions } = useCollection<Transaction>(transactionsQuery);
  const { data: goals } = useCollection<BudgetGoal>(goalsQuery);

  useEffect(() => {
    setDisplayName(user?.displayName ?? "");
    setPhotoURL(user?.photoURL ?? "");
  }, [user]);

  useEffect(() => {
    if (!avatarFile) return;
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreviewURL(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  useEffect(() => {
    if (profileData) {
      setUsername(profileData.username || "");
      setPhoneCode(profileData.phoneCode || "+91");
      setPhoneNumber(profileData.phoneNumber || "");
    }
  }, [profileData]);

  const sanitize = (str: string) => str.replace(/[<>"'`]/g, "");
  const currentDisplayName = sanitize(displayName || user?.displayName || user?.email?.split("@")[0] || "Anonymous");
  const currentPhotoURL = avatarPreviewURL || photoURL || user?.photoURL || undefined;
  const currentUsername = sanitize(username || profileData?.username || "");
  const currentPhone = profileData?.phoneNumber ? `${profileData.phoneCode || "+91"} ${profileData.phoneNumber}` : "";
  const safeUid = uid?.replace(/[^a-zA-Z0-9]/g, "") || "lumina";
  const fallbackPhotoURL = `https://picsum.photos/seed/${safeUid}/200/200`;
  const memberSince = user?.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Recently";

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged out", description: "Safe travels!" });
      router.push("/login");
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: e instanceof Error ? e.message : String(e) });
    }
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "Invalid Image", description: "Choose an image file." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "Too Large", description: "Choose an image under 5MB." });
      return;
    }
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX = 400;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { setAvatarFile(file); return; }
          const compressed = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
          setAvatarFile(compressed);
        },
        "image/jpeg",
        0.8
      );
    };
    img.src = objectUrl;
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      let nextPhotoURL = photoURL.trim() || user.photoURL || null;
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const ref = storageRef(storage, `users/${user.uid}/profile/avatar-${Date.now()}.${ext}`);
        const result = await uploadBytes(ref, avatarFile, { contentType: avatarFile.type });
        nextPhotoURL = await getDownloadURL(result.ref);
      }
      await updateProfile(user, { displayName: sanitize(displayName.trim()) || null, photoURL: nextPhotoURL });
      const profileWrite = setDoc(doc(db, "users", user.uid, "profile", "info"), {
        username: sanitize(username.trim()), phoneCode, phoneNumber: phoneNumber.trim(),
      }, { merge: true });
      await profileWrite;

      let didChangePassword = false;
      if (newPassword.trim()) {
        if (user.providerData[0]?.providerId === "password") {
          if (!currentPassword.trim()) {
            toast({ variant: "destructive", title: "Current Password Required", description: "Enter your current password." });
            setIsSaving(false);
            return;
          }
          const credential = EmailAuthProvider.credential(user.email!, currentPassword);
          await reauthenticateWithCredential(user, credential);
        }
        await updatePassword(user, newPassword.trim());
        didChangePassword = true;
      }
      toast({ title: "Profile Updated", description: didChangePassword ? "Profile and password updated." : "Your details are now current." });
      setPhotoURL(nextPhotoURL ?? "");
      setAvatarFile(null);
      setAvatarPreviewURL("");
      setNewPassword(""); setCurrentPassword("");
      setIsEditing(false);
    } catch (e) {
      console.error("Profile save failed:", e);
      toast({ variant: "destructive", title: "Update Failed", description: e instanceof Error ? e.message : String(e) });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-6xl mx-auto w-full space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-1">Account</h1>
          <p className="text-muted-foreground text-lg">Manage your identity and Lumina settings.</p>
        </div>
        <Badge variant="outline" className="w-fit h-fit px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary flex items-center gap-2 text-xs font-bold">
          <Calendar className="h-3.5 w-3.5" /> Member since {memberSince}
        </Badge>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-5">
          <Card className="overflow-hidden glass-card border-white/5 relative">
            <div className="h-24 bg-gradient-to-br from-primary/30 via-accent/20 to-transparent w-full" />
            <div className="px-8 pb-8 -mt-14 flex flex-col items-center text-center space-y-4">
              <div className="relative group">
                <Avatar className="h-28 w-28 border-4 border-background shadow-2xl ring-2 ring-primary/30">
                  <AvatarImage src={currentPhotoURL || fallbackPhotoURL} />
                  <AvatarFallback className="text-3xl bg-primary/10 text-primary font-headline">
                    {user?.email?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => setIsEditing(true)}
                  className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-card/95 border border-white/10 flex items-center justify-center shadow-lg hover:bg-primary/20 hover:border-primary/40 transition-all group-hover:scale-110"
                >
                  <Camera className="h-3.5 w-3.5 text-foreground" />
                </button>
              </div>

              <div>
                <h2 className="text-xl font-headline font-bold">{currentDisplayName}</h2>
                {currentUsername && (
                  <p className="text-primary/70 text-sm flex items-center justify-center gap-1 mt-0.5">
                    <AtSign className="h-3 w-3" />{currentUsername}
                  </p>
                )}
                <p className="text-muted-foreground text-xs flex items-center justify-center gap-1.5 mt-1">
                  <Mail className="h-3 w-3" />{user?.email}
                </p>
                {currentPhone && (
                  <p className="text-muted-foreground text-xs flex items-center justify-center gap-1.5 mt-0.5">
                    <Phone className="h-3 w-3" />{currentPhone}
                  </p>
                )}
              </div>

              <div className="w-full pt-5 border-t border-white/5 space-y-3">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                  <span className="flex items-center gap-1.5"><Crown className="h-3 w-3" />Member Tier</span>
                  <span className="text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">Explorer</span>
                </div>
                <Button
                  onClick={() => router.push("/pro")}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold font-headline text-sm group border-none shadow-lg shadow-primary/20"
                >
                  UPGRADE TO ELITE <Zap className="ml-2 h-3.5 w-3.5 fill-current group-hover:scale-125 transition-transform" />
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-5 glass-card border-white/5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Statistics</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: transactions?.length || 0, label: "Transactions" },
                { value: goals?.length || 0, label: "Active Goals" },
              ].map(({ value, label }) => (
                <div key={label} className="bg-muted/30 p-4 rounded-2xl border border-white/5 text-center">
                  <p className="text-2xl font-headline font-bold text-primary">{value}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="w-full justify-start bg-muted/20 p-1 h-auto rounded-2xl border border-white/5 mb-7">
              {["profile", "security", "preferences"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="rounded-xl px-6 py-2.5 capitalize text-sm font-medium data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="profile" className="space-y-6 animate-in fade-in duration-500">
              <Card className="p-7 glass-card border-white/5">
                <h3 className="text-xl font-headline font-bold mb-6 flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  Profile Details
                </h3>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Full Name", value: currentDisplayName || "Set in Settings", icon: User },
                      { label: "Username", value: currentUsername || "Not set", icon: AtSign, muted: !currentUsername },
                      { label: "Email Address", value: user?.email || "", icon: Mail },
                      { label: "Phone", value: currentPhone || "Not set", icon: Phone, muted: !currentPhone },
                    ].map(({ label, value, icon: Icon, muted }) => (
                      <div key={label} className="space-y-1.5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.18em]">{label}</p>
                        <div className={`flex items-center gap-2.5 p-3.5 bg-muted/30 rounded-xl border border-white/5 ${muted ? "text-muted-foreground italic" : "font-medium"}`}>
                          <Icon className="h-3.5 w-3.5 text-primary/50 shrink-0" />
                          <span className="text-sm truncate">{value}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-5 border-t border-white/5 flex flex-col sm:flex-row gap-3">
                    <Dialog open={isEditing} onOpenChange={(open) => {
                      setIsEditing(open);
                      if (!open) { 
                        setNewPassword(""); 
                        setCurrentPassword(""); 
                        setShowPassword(false); 
                        setShowNewPassword(false); 
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button className="flex-1 h-12 rounded-xl bg-foreground text-background font-bold font-headline hover:bg-foreground/90 transition-all active:scale-[0.98]">
                          EDIT PROFILE
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass-card border-white/10 sm:max-w-[520px] p-8 max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="font-headline text-2xl font-bold">Edit Profile</DialogTitle>
                          <DialogDescription>Update your personal information and account settings.</DialogDescription>
                        </DialogHeader>

                        <div className="flex justify-center py-5">
                          <div className="flex flex-col items-center gap-3">
                            <Label htmlFor="profile-photo" className="relative cursor-pointer group">
                              <Avatar className="h-20 w-20 border-4 border-primary/20 shadow-xl">
                                <AvatarImage src={currentPhotoURL || fallbackPhotoURL} />
                                <AvatarFallback className="text-2xl bg-primary/10 text-primary">{user?.email?.[0].toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <span className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-card/95 border border-white/10 flex items-center justify-center shadow-lg group-hover:bg-primary/20 transition-colors">
                                <Camera className="h-3 w-3 text-foreground" />
                              </span>
                            </Label>
                            <Input id="profile-photo" type="file" accept="image/*" onChange={handleAvatarChange} disabled={isSaving} className="sr-only" />
                            <Label htmlFor="profile-photo" className="inline-flex h-9 cursor-pointer items-center justify-center rounded-xl bg-muted px-4 text-xs font-bold uppercase tracking-widest hover:bg-muted/80 transition-colors">
                              Choose Photo
                            </Label>
                            {avatarFile && <p className="max-w-[240px] truncate text-xs text-muted-foreground">{avatarFile.name}</p>}
                          </div>
                        </div>

                        <div className="grid gap-4">
                          <FieldInput label="Name" id="display-name" value={displayName} onChange={setDisplayName} placeholder="Your name" />
                          <FieldInput label="Email" id="email" value={user?.email || ""} readOnly className="text-muted-foreground cursor-not-allowed opacity-60" />
                          <div className="grid gap-1.5">
                            <Label htmlFor="username" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Username</Label>
                            <div className="relative">
                              <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="johndoe" className="bg-muted border-none h-11 rounded-xl pl-10" />
                            </div>
                          </div>

                          {user?.providerData[0]?.providerId !== "google.com" && (
                            <>
                              <PasswordField label="Current Password" id="current-pass" value={currentPassword} onChange={setCurrentPassword} show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
                              <PasswordField label="New Password" id="new-pass" value={newPassword} onChange={setNewPassword} placeholder="Leave blank to keep current" show={showNewPassword} onToggle={() => setShowNewPassword(!showNewPassword)} />
                            </>
                          )}

                          <div className="grid gap-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Phone Number</Label>
                            <div className="flex gap-2">
                              <select value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)} className="bg-muted border-none h-11 rounded-xl px-3 text-sm font-medium appearance-none cursor-pointer min-w-[72px] focus:outline-none focus:ring-2 focus:ring-primary/40">
                                {["+91","+1","+44","+61","+81","+86","+49","+33","+971","+65"].map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                              <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))} placeholder="9876543210" className="bg-muted border-none h-11 rounded-xl flex-1" maxLength={15} />
                            </div>
                          </div>
                        </div>

                        <DialogFooter className="pt-5 gap-2">
                          <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl">Cancel</Button>
                          <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-primary text-primary-foreground px-7 font-bold font-headline h-11 rounded-xl gap-2">
                            {isSaving ? <><Loader2 className="h-4 w-4 animate-spin" />SAVING…</> : <><Save className="h-4 w-4" />SAVE CHANGES</>}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button onClick={handleLogout} variant="destructive" className="flex-1 h-12 rounded-xl gap-2 font-headline font-bold shadow-lg shadow-destructive/10 active:scale-[0.98] transition-all">
                      <LogOut className="h-4 w-4" /> LOG OUT
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="animate-in fade-in duration-500">
              <Card className="p-7 glass-card border-white/5">
                <h3 className="text-xl font-headline font-bold mb-6 flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Lock className="h-4 w-4 text-primary" />
                  </div>
                  Security &amp; Access
                </h3>

                <div className="space-y-4">
                  <SecurityRow
                    icon={<Zap className="h-5 w-5 text-emerald-400" />}
                    iconBg="bg-emerald-500/10"
                    title="Account Verified"
                    desc={user?.emailVerified ? "Your identity is confirmed" : "Verification required"}
                  />
                  <SecurityRow
                    icon={<Smartphone className="h-5 w-5 text-primary" />}
                    iconBg="bg-primary/10"
                    title="Two-Factor Auth"
                    desc="Add an extra layer of security"
                    action={<Switch disabled />}
                  />
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function FieldInput({ label, id, value, onChange, placeholder, readOnly, className }: {
  label: string; id: string; value: string; onChange?: (v: string) => void;
  placeholder?: string; readOnly?: boolean; className?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</Label>
      <Input id={id} value={value} onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder} readOnly={readOnly} className={`bg-muted border-none h-11 rounded-xl ${className || ""}`} />
    </div>
  );
}

function PasswordField({ label, id, value, onChange, placeholder, show, onToggle }: {
  label: string; id: string; value: string; onChange: (v: string) => void;
  placeholder?: string; show: boolean; onToggle: () => void;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</Label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          id={id} 
          type={show ? "text" : "password"} 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "••••••••••"} 
          className="bg-muted border-none h-11 rounded-xl pl-10 pr-11" 
        />
        <button 
          type="button" 
          onClick={onToggle} 
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function SecurityRow({ icon, iconBg, title, desc, action }: {
  icon: React.ReactNode; iconBg: string; title: string; desc: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-white/5">
      <div className="flex items-center gap-3.5">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>{icon}</div>
        <div>
          <p className="font-semibold text-sm">{title}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      {action}
    </div>
  );
}