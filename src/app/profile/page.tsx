"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { useUser } from "@/lib/use-user";
import { supabase } from "@/lib/supabase";
import { uploadAvatar } from "@/lib/storage";
import { useCollection } from "@/lib/use-collection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  User, Mail, Zap, LogOut, Crown, Lock, Smartphone,
  Camera, AtSign, Phone, Eye, EyeOff, Save, Loader2,
  ShieldCheck, ChevronRight, CreditCard, Target, Pencil,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { Transaction, BudgetGoal } from "@/app/lib/types";

interface ProfileRow {
  id: string;
  username: string | null;
  phone_code: string | null;
  phone_number: string | null;
  avatar_url: string | null;
}

export default function ProfilePage() {
  const { user, refresh: refreshUser } = useUser();
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
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [profileData, setProfileData] = useState<ProfileRow | null>(null);

  const uid = user?.uid;
  const { data: transactions } = useCollection<Transaction>("transactions", uid);
  const { data: goals } = useCollection<BudgetGoal>("goals", uid);

  useEffect(() => {
    if (!uid) return;
    supabase.from("profiles").select("*").eq("id", uid).single().then(({ data }) => {
      if (data) setProfileData(data as ProfileRow);
    });
  }, [uid]);

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
      setPhoneCode(profileData.phone_code || "+91");
      setPhoneNumber(profileData.phone_number || "");
    }
  }, [profileData]);

  const sanitize = (str: string) => str.replace(/[<>"'`]/g, "");
  const currentDisplayName = sanitize(displayName || user?.displayName || user?.email?.split("@")[0] || "Anonymous");
  const currentPhotoURL = avatarPreviewURL || photoURL || user?.photoURL || undefined;
  const currentUsername = sanitize(username || profileData?.username || "");
  const currentPhone = profileData?.phone_number ? `${profileData.phone_code || "+91"} ${profileData.phone_number}` : "";
  const safeUid = uid?.replace(/[^a-zA-Z0-9]/g, "") || "lumina";
  const fallbackPhotoURL = `https://picsum.photos/seed/${safeUid}/200/200`;
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Recently";
  const isGoogleUser = user?.provider === "google";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out", description: "Safe travels!" });
    router.push("/login");
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "Invalid file", description: "Choose an image file." });
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
      canvas.toBlob((blob) => {
        if (!blob) { setAvatarFile(file); return; }
        setAvatarFile(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
      }, "image/jpeg", 0.8);
    };
    img.src = objectUrl;
  };

  const handleSaveProfile = async () => {
    if (!user || !uid || isSaving) return;
    setIsSaving(true);
    try {
      let nextPhotoURL = photoURL.trim() || user.photoURL || null;
      if (avatarFile) nextPhotoURL = await uploadAvatar(uid, avatarFile);

      const cleanName = sanitize(displayName.trim()) || null;
      await supabase.auth.updateUser({ data: { full_name: cleanName, display_name: cleanName, avatar_url: nextPhotoURL } });
      await supabase.from("profiles").upsert({ id: uid, username: sanitize(username.trim()), phone_code: phoneCode, phone_number: phoneNumber.trim(), avatar_url: nextPhotoURL });

      if (newPassword.trim()) {
        const { error: pwError } = await supabase.auth.updateUser({ password: newPassword.trim() });
        if (pwError) throw new Error(pwError.message);
      }

      await refreshUser();
      const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
      if (data) setProfileData(data as ProfileRow);

      toast({ title: "Profile Updated", description: "Your details are now current." });
      setPhotoURL(nextPhotoURL ?? "");
      setAvatarFile(null);
      setAvatarPreviewURL("");
      setNewPassword("");
      setIsEditing(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed", description: e instanceof Error ? e.message : String(e) });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="relative h-36 bg-gradient-to-br from-primary/40 via-accent/20 to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(186,156,255,0.15),transparent_60%)]" />
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-16 -mt-16">

        {/* Avatar + Name block */}
        <div className="flex items-end justify-between mb-6">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-background shadow-2xl ring-2 ring-primary/30">
              <AvatarImage src={currentPhotoURL || fallbackPhotoURL} />
              <AvatarFallback className="text-3xl bg-primary/10 text-primary font-headline">
                {user?.email?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => setIsEditing(true)}
              className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary flex items-center justify-center shadow-lg border-2 border-background"
            >
              <Camera className="h-3.5 w-3.5 text-primary-foreground" />
            </button>
          </div>
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="gap-2 rounded-xl h-10 border-white/10 bg-muted/30 font-bold text-sm"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit Profile
          </Button>
        </div>

        {/* Name & info */}
        <div className="mb-8">
          <h1 className="text-2xl font-headline font-bold">{currentDisplayName}</h1>
          {currentUsername && (
            <p className="text-primary/70 text-sm flex items-center gap-1 mt-0.5">
              <AtSign className="h-3 w-3" />{currentUsername}
            </p>
          )}
          <p className="text-muted-foreground text-sm mt-1">{user?.email}</p>
          {currentPhone && <p className="text-muted-foreground text-sm">{currentPhone}</p>}
          <p className="text-xs text-muted-foreground/60 mt-2">Member since {memberSince}</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { icon: CreditCard, value: transactions?.length || 0, label: "Transactions" },
            { icon: Target,     value: goals?.length || 0,        label: "Active Goals"  },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="glass-card rounded-2xl p-4 border border-white/5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-headline font-bold">{value}</p>
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Upgrade Banner */}
        <div className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-primary/20 to-accent/10 border border-primary/20 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Crown className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Explorer Plan</span>
              </div>
              <p className="text-sm text-muted-foreground">Upgrade for AI portfolio advice & advanced analytics.</p>
            </div>
            <Button onClick={() => router.push("/pro")} size="sm" className="shrink-0 rounded-xl bg-primary text-primary-foreground font-bold gap-1">
              <Zap className="h-3.5 w-3.5" /> Upgrade
            </Button>
          </div>
        </div>

        {/* Account section */}
        <Section title="Account">
          <RowItem icon={<User className="h-4 w-4 text-primary" />} label="Full Name" value={currentDisplayName} />
          <RowItem icon={<Mail className="h-4 w-4 text-primary" />} label="Email" value={user?.email || "—"} />
          <RowItem icon={<AtSign className="h-4 w-4 text-primary" />} label="Username" value={currentUsername || "Not set"} muted={!currentUsername} />
          <RowItem icon={<Phone className="h-4 w-4 text-primary" />} label="Phone" value={currentPhone || "Not set"} muted={!currentPhone} />
        </Section>

        {/* Security section */}
        <Section title="Security">
          <RowItem
            icon={<ShieldCheck className="h-4 w-4 text-emerald-400" />}
            label="Email Verified"
            value={user?.emailVerified ? "Verified" : "Not verified"}
            valueClass={user?.emailVerified ? "text-emerald-400" : "text-amber-400"}
          />
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-muted/50 flex items-center justify-center">
                <Smartphone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Two-Factor Auth</p>
                <p className="text-xs text-muted-foreground">Extra layer of security</p>
              </div>
            </div>
            <Switch disabled />
          </div>
          {!isGoogleUser && (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-muted/50 flex items-center justify-center">
                  <Lock className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm font-medium">Change Password</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </Section>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full h-12 rounded-xl font-bold font-headline gap-2"
          >
            <LogOut className="h-4 w-4" /> LOG OUT
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={(open) => {
        setIsEditing(open);
        if (!open) { setNewPassword(""); setShowNewPassword(false); }
      }}>
        <DialogContent className="glass-card border-white/10 sm:max-w-[500px] p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl font-bold">Edit Profile</DialogTitle>
            <DialogDescription>Update your personal information.</DialogDescription>
          </DialogHeader>

          {/* Avatar picker */}
          <div className="flex flex-col items-center gap-3 py-4">
            <Label htmlFor="profile-photo" className="relative cursor-pointer group">
              <Avatar className="h-20 w-20 border-4 border-primary/20 shadow-xl">
                <AvatarImage src={currentPhotoURL || fallbackPhotoURL} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">{user?.email?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary flex items-center justify-center shadow-lg border-2 border-background group-hover:scale-110 transition-transform">
                <Camera className="h-3 w-3 text-primary-foreground" />
              </span>
            </Label>
            <Input id="profile-photo" type="file" accept="image/*" onChange={handleAvatarChange} disabled={isSaving} className="sr-only" />
            <Label htmlFor="profile-photo" className="inline-flex h-8 cursor-pointer items-center justify-center rounded-lg bg-muted px-4 text-xs font-bold uppercase tracking-widest hover:bg-muted/80 transition-colors">
              Choose Photo
            </Label>
            {avatarFile && <p className="max-w-[240px] truncate text-xs text-muted-foreground">{avatarFile.name}</p>}
          </div>

          <div className="grid gap-4">
            <FieldInput label="Full Name" id="display-name" value={displayName} onChange={setDisplayName} placeholder="Your name" />
            <FieldInput label="Email" id="email" value={user?.email || ""} readOnly className="opacity-50 cursor-not-allowed" />
            <div className="grid gap-1.5">
              <Label htmlFor="username" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Username</Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="johndoe" className="bg-muted border-none h-11 rounded-xl pl-10" />
              </div>
            </div>

            {!isGoogleUser && (
              <PasswordField label="New Password" id="new-pass" value={newPassword} onChange={setNewPassword} placeholder="Leave blank to keep current" show={showNewPassword} onToggle={() => setShowNewPassword(!showNewPassword)} />
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

          <DialogFooter className="pt-4 gap-2">
            <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-primary text-primary-foreground px-6 font-bold font-headline h-11 rounded-xl gap-2">
              {isSaving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> : <><Save className="h-4 w-4" />Save Changes</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1 mb-2">{title}</p>
      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden divide-y divide-white/5">
        {children}
      </div>
    </div>
  );
}

function RowItem({ icon, label, value, muted, valueClass }: {
  icon: React.ReactNode; label: string; value: string; muted?: boolean; valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">{icon}</div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
      <p className={`text-sm font-medium text-right max-w-[55%] truncate ${muted ? "text-muted-foreground/50 italic" : valueClass || "text-foreground"}`}>{value}</p>
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
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input id={id} type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "••••••••••"} className="bg-muted border-none h-11 rounded-xl pl-10 pr-11" />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1" aria-label={show ? "Hide" : "Show"}>
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
