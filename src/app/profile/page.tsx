"use client";

import { useState, useEffect, useMemo, type ChangeEvent } from "react";
import { useUser, useAuth, useFirestore, useFirebaseApp } from "@/firebase";
import { useDoc } from "@/firebase/firestore/use-doc";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User, Mail, Shield, Zap, LogOut, ChevronRight, Camera, Phone, AtSign, Eye, EyeOff, Lock, Save } from "lucide-react";
import { signOut, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { doc, setDoc, DocumentReference } from "firebase/firestore";
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from "firebase/storage";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

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
  const [isSaving, setIsSaving] = useState(false);

  // Firestore profile document reference
  const profileRef = useMemo(
    () => (user?.uid ? doc(db, 'users', user.uid, 'profile', 'info') as DocumentReference<UserProfile> : null),
    [db, user?.uid]
  );
  const storage = useMemo(() => getStorage(firebaseApp), [firebaseApp]);

  const { data: profileData } = useDoc<UserProfile>(profileRef);

  useEffect(() => {
    setDisplayName(user?.displayName ?? "");
    setPhotoURL(user?.photoURL ?? "");
  }, [user]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreviewURL("");
      return;
    }

    const previewURL = URL.createObjectURL(avatarFile);
    setAvatarPreviewURL(previewURL);

    return () => URL.revokeObjectURL(previewURL);
  }, [avatarFile]);

  useEffect(() => {
    if (profileData) {
      setUsername(profileData.username || "");
      setPhoneCode(profileData.phoneCode || "+91");
      setPhoneNumber(profileData.phoneNumber || "");
    }
  }, [profileData]);

  const currentDisplayName = displayName || user?.displayName || user?.email?.split('@')[0] || "Anonymous";
  const currentPhotoURL = avatarPreviewURL || photoURL || user?.photoURL || undefined;
  const currentUsername = username || profileData?.username || "";
  const currentPhone = profileData?.phoneNumber ? `${profileData.phoneCode || '+91'} ${profileData.phoneNumber}` : "";
  const fallbackPhotoURL = `https://picsum.photos/seed/${user?.uid || 'lumina'}/200/200`;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged out", description: "Safe travels!" });
      router.push('/login');
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      toast({ variant: "destructive", title: "Error", description: message });
    }
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "Invalid Image", description: "Choose an image file for your profile photo." });
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "Image Too Large", description: "Choose an image under 5 MB." });
      event.target.value = "";
      return;
    }

    setAvatarFile(file);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      let nextPhotoURL = photoURL.trim() || user.photoURL || null;

      if (avatarFile) {
        const extension = avatarFile.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
        const avatarRef = storageRef(storage, `users/${user.uid}/profile/avatar-${Date.now()}.${extension}`);
        const uploadResult = await uploadBytes(avatarRef, avatarFile, { contentType: avatarFile.type });
        nextPhotoURL = await getDownloadURL(uploadResult.ref);
      }

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: displayName.trim() || null,
        photoURL: nextPhotoURL,
      });

      // Save extra fields to Firestore
      const profileDocRef = doc(db, 'users', user.uid, 'profile', 'info');
      await setDoc(profileDocRef, {
        username: username.trim(),
        phoneCode: phoneCode,
        phoneNumber: phoneNumber.trim(),
      }, { merge: true });

      // Handle password change if provided
      if (newPassword.trim()) {
        if (user.providerData[0]?.providerId === 'password') {
          if (!currentPassword.trim()) {
            toast({ variant: "destructive", title: "Current Password Required", description: "Enter your current password to set a new one." });
            setIsSaving(false);
            return;
          }
          const credential = EmailAuthProvider.credential(user.email!, currentPassword);
          await reauthenticateWithCredential(user, credential);
        }
        await updatePassword(user, newPassword.trim());
        toast({ title: "Password Updated", description: "Your password has been changed successfully." });
      }

      toast({ title: "Profile Updated", description: "Your account details are now current." });
      setPhotoURL(nextPhotoURL ?? "");
      setAvatarFile(null);
      setNewPassword("");
      setCurrentPassword("");
      setIsEditing(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      toast({ variant: "destructive", title: "Update Failed", description: message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-5xl mx-auto w-full space-y-12">
      <header>
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-2">Account</h1>
        <p className="text-muted-foreground text-lg">Manage your identity and Lumina settings.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Brief Profile */}
        <div className="space-y-6">
          <Card className="p-8 glass-card border-white/5 flex flex-col items-center text-center space-y-6">
            <div className="relative group">
              <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-2xl">
                <AvatarImage src={currentPhotoURL || fallbackPhotoURL} />
                <AvatarFallback className="text-4xl bg-primary/10 text-primary">{user?.email?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <button
                onClick={() => setIsEditing(true)}
                className="absolute bottom-1 right-1 h-9 w-9 rounded-full bg-muted/90 backdrop-blur-sm border-2 border-background flex items-center justify-center shadow-lg hover:bg-primary/20 hover:border-primary/40 transition-all duration-200 group-hover:scale-110"
              >
                <Camera className="h-4 w-4 text-foreground" />
              </button>
            </div>
            <div>
              <h2 className="text-2xl font-headline font-bold">{currentDisplayName}</h2>
              {currentUsername && (
                <p className="text-primary/80 text-sm flex items-center justify-center gap-1 mt-0.5">
                  <AtSign className="h-3 w-3" />{currentUsername}
                </p>
              )}
              <p className="text-muted-foreground text-sm flex items-center justify-center gap-1.5 mt-1">
                <Mail className="h-3 w-3" /> {user?.email}
              </p>
              {currentPhone && (
                <p className="text-muted-foreground text-sm flex items-center justify-center gap-1.5 mt-1">
                  <Phone className="h-3 w-3" /> {currentPhone}
                </p>
              )}
            </div>
            <div className="w-full pt-6 border-t border-white/5 space-y-4">
               <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                 <span>Member Tier</span>
                 <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-full">Explorer</span>
               </div>
               <Button onClick={() => router.push('/pro')} className="w-full bg-primary text-primary-foreground font-bold font-headline h-12 rounded-xl group">
                 UPGRADE TO ELITE <Zap className="ml-2 h-4 w-4 fill-current group-hover:scale-125 transition-transform" />
               </Button>
            </div>
          </Card>

          <Card className="p-6 glass-card border-white/5 space-y-4">
            <h4 className="text-sm font-headline font-bold text-foreground uppercase tracking-wider">Quick Actions</h4>
            <div className="space-y-1">
              <Button variant="ghost" onClick={() => toast({ title: "Privacy Settings", description: "Privacy settings are coming soon." })} className="w-full justify-between h-12 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-foreground group">
                <span className="flex items-center gap-3"><Shield className="h-4 w-4" /> Privacy Settings</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="ghost" onClick={() => toast({ title: "Connected Apps", description: "Connected apps support is coming soon." })} className="w-full justify-between h-12 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-foreground group">
                <span className="flex items-center gap-3"><Zap className="h-4 w-4" /> Connected Apps</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Detailed Settings */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8 glass-card border-white/5">
            <h3 className="text-2xl font-headline font-bold mb-8 flex items-center gap-3">
              <User className="h-6 w-6 text-primary" /> Profile Details
            </h3>
            
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Full Name</p>
                  <p className="text-lg font-medium p-4 bg-muted/30 rounded-2xl border border-white/5">{currentDisplayName || 'Set in Settings'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Username</p>
                  <p className="text-lg font-medium p-4 bg-muted/30 rounded-2xl border border-white/5 flex items-center gap-2">
                    {currentUsername ? (
                      <><AtSign className="h-4 w-4 text-primary/60" />{currentUsername}</>
                    ) : (
                      <span className="text-muted-foreground italic">Not set</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Email Address</p>
                  <p className="text-lg font-medium p-4 bg-muted/30 rounded-2xl border border-white/5 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary/60" /> {user?.email}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Phone Number</p>
                  <p className="text-lg font-medium p-4 bg-muted/30 rounded-2xl border border-white/5 flex items-center gap-2">
                    {currentPhone ? (
                      <><Phone className="h-4 w-4 text-primary/60" />{currentPhone}</>
                    ) : (
                      <span className="text-muted-foreground italic">Not set</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Email Provider</p>
                  <p className="text-lg font-medium p-4 bg-muted/30 rounded-2xl border border-white/5 flex items-center gap-2">
                    {user?.providerData[0]?.providerId === 'google.com' ? 'Google Intelligence' : 'Email/Password'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Password</p>
                  <p className="text-lg font-medium p-4 bg-muted/30 rounded-2xl border border-white/5 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary/60" />
                    <span className="tracking-widest">••••••••••</span>
                  </p>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4">
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
                    <Button className="flex-1 h-14 rounded-2xl bg-foreground text-background font-bold font-headline hover:bg-foreground/90">
                      EDIT PROFILE
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-card border-white/10 sm:max-w-[540px] p-8 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="font-headline text-3xl font-bold mb-2">Edit Profile</DialogTitle>
                      <DialogDescription>Update your personal information and account settings.</DialogDescription>
                    </DialogHeader>

                    {/* Avatar Preview */}
                    <div className="flex justify-center py-4">
                      <div className="flex flex-col items-center gap-3">
                        <Label htmlFor="profile-photo" className="relative cursor-pointer group">
                          <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-xl">
                            <AvatarImage src={currentPhotoURL || fallbackPhotoURL} />
                            <AvatarFallback className="text-3xl bg-primary/10 text-primary">{user?.email?.[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-muted/90 backdrop-blur-sm border-2 border-background flex items-center justify-center shadow-lg group-hover:bg-primary/20 group-hover:border-primary/40 transition-colors">
                            <Camera className="h-3.5 w-3.5 text-foreground" />
                          </span>
                        </Label>
                        <Input
                          id="profile-photo"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          disabled={isSaving}
                          className="sr-only"
                        />
                        <Label
                          htmlFor="profile-photo"
                          className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl bg-muted px-4 text-xs font-bold uppercase tracking-widest text-foreground hover:bg-muted/80 transition-colors"
                        >
                          Choose Photo
                        </Label>
                        {avatarFile && (
                          <p className="max-w-[260px] truncate text-xs text-muted-foreground">{avatarFile.name}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-5 py-2">
                      {/* Name */}
                      <div className="grid gap-2">
                        <Label htmlFor="display-name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Name</Label>
                        <Input
                          id="display-name"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Charlotte King"
                          className="bg-muted border-none h-12 rounded-xl"
                        />
                      </div>

                      {/* Email (read-only) */}
                      <div className="grid gap-2">
                        <Label htmlFor="email-address" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">E-mail Address</Label>
                        <Input
                          id="email-address"
                          value={user?.email || ""}
                          readOnly
                          className="bg-muted/50 border-none h-12 rounded-xl text-muted-foreground cursor-not-allowed"
                        />
                      </div>

                      {/* Username */}
                      <div className="grid gap-2">
                        <Label htmlFor="username" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Username</Label>
                        <div className="relative">
                          <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="johndoe"
                            className="bg-muted border-none h-12 rounded-xl pl-10"
                          />
                        </div>
                      </div>

                      {/* Password */}
                      {user?.providerData[0]?.providerId !== 'google.com' && (
                        <>
                          <div className="grid gap-2">
                            <Label htmlFor="current-password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Current Password</Label>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="current-password"
                                type={showPassword ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••••"
                                className="bg-muted border-none h-12 rounded-xl pl-10 pr-12"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="new-password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">New Password</Label>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="new-password"
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Leave blank to keep current"
                                className="bg-muted border-none h-12 rounded-xl pl-10 pr-12"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Phone Number */}
                      <div className="grid gap-2">
                        <Label htmlFor="phone-number" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phone Number</Label>
                        <div className="flex gap-2">
                          <select
                            value={phoneCode}
                            onChange={(e) => setPhoneCode(e.target.value)}
                            className="bg-muted border-none h-12 rounded-xl px-3 text-sm font-medium appearance-none cursor-pointer text-foreground min-w-[80px] focus:outline-none focus:ring-2 focus:ring-primary/40"
                          >
                            <option value="+91">+91</option>
                            <option value="+1">+1</option>
                            <option value="+44">+44</option>
                            <option value="+61">+61</option>
                            <option value="+81">+81</option>
                            <option value="+86">+86</option>
                            <option value="+49">+49</option>
                            <option value="+33">+33</option>
                            <option value="+971">+971</option>
                            <option value="+65">+65</option>
                          </select>
                          <Input
                            id="phone-number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="9876543210"
                            className="bg-muted border-none h-12 rounded-xl flex-1"
                            maxLength={15}
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter className="pt-4 gap-2">
                      <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl">Cancel</Button>
                      <Button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="bg-primary text-primary-foreground px-8 font-bold font-headline h-12 rounded-xl gap-2"
                      >
                        {isSaving ? (
                          <span className="flex items-center gap-2">
                            <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            SAVING...
                          </span>
                        ) : (
                          <><Save className="h-4 w-4" /> SAVE CHANGES</>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button 
                  onClick={handleLogout}
                  variant="destructive" 
                  className="flex-1 h-14 rounded-2xl gap-2 font-headline font-bold text-lg shadow-lg shadow-destructive/10"
                >
                  <LogOut className="h-5 w-5" /> LOG OUT
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-8 glass-card border-primary/20 bg-primary/5 overflow-hidden relative">
            <div className="relative z-10 space-y-4">
              <h3 className="text-2xl font-headline font-bold text-primary">Need Financial Advice?</h3>
              <p className="text-muted-foreground max-w-md">Our premium AI agents can help you optimize your portfolio and plan for early retirement.</p>
              <Button variant="outline" className="rounded-xl border-primary/30 hover:bg-primary/10" onClick={() => router.push('/pro')}>
                TALK TO ELITE AI
              </Button>
            </div>
            <Zap className="absolute -bottom-10 -right-10 h-48 w-48 text-primary/5 pointer-events-none" />
          </Card>
        </div>
      </div>
    </div>
  );
}
