"use client";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Save } from "lucide-react";
import { Mail, Building, Hash, UserCircle, ShieldCheck } from "lucide-react";
import { Label } from "../ui/label";
import { POST } from "@/app/api/admin/courseallocations/route";
import { toast } from "sonner";

export interface LecturerProfileProps {
  onPasswordChange?: (oldPassword: string, newPassword: string) => void;
}

export interface lecturerProfile {
  id: string;
  departmentId: string;
  department: {
    id: string;
    name: string;
  };
  user: {
    email: string;
    role: string;
  };
  firstName: string;
  lastName: string;
  staffId: string;
  userId: string;
}

const LecturerProfile = ({ onPasswordChange }: LecturerProfileProps) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profile, setProfile] = useState<lecturerProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [error, setError] = useState("");

  const handlePasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Please complete all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (!onPasswordChange) {
      setMessage("Password change is not available in this context.");
      return;
    }

    onPasswordChange(oldPassword, newPassword);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("Password update request sent.");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes] = await Promise.all([
          fetch("/api/lecturer/profile"),
        ]);

        if (!profileRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const profileData = await profileRes.json();

        setProfile(profileData);
      } catch (err) {
        console.log("Failed to load data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return loading ? (
    <div className="text-center py-8">Loading Profile...</div>
  ) : showPasswordForm ? (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={() => setShowPasswordForm(false)}>
          Back
        </Button>
      </div>
      <PasswordChangeUI url="/api/lecturer/resetPassword"/>
    </div>
  ) : (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-6">
        <Avatar className="w-24 h-24 border-4 border-emerald-50 shadow-lg">
          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-3xl font-bold">
            {profile?.firstName?.charAt(0)}
            {profile?.lastName?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">
            {profile?.firstName} {profile?.lastName}
          </h1>
          <p className="text-zinc-500 font-medium">Faculty Member</p>
          <Badge className="mt-2 bg-emerald-600 hover:bg-emerald-700">
            <ShieldCheck size={14} className="mr-1" /> Verified Lecturer
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase text-zinc-500">
              Professional Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Hash className="text-emerald-600" size={18} />
              <div>
                <p className="text-xs text-zinc-400">Staff ID</p>
                <p className="font-mono font-medium">{profile?.staffId}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building className="text-emerald-600" size={18} />
              <div>
                <p className="text-xs text-zinc-400">Department</p>
                <p className="font-medium">{profile?.department.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase text-zinc-500">
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="text-emerald-600" size={18} />
              <div>
                <p className="text-xs text-zinc-400">Official Email</p>
                <p className="font-medium">{profile?.user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <UserCircle className="text-emerald-600" size={18} />
              <div>
                <p className="text-xs text-zinc-400">Role</p>
                <p className="font-medium capitalize">
                  {profile?.user.role.toLowerCase()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="max-w-4xl mx-auto">
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock size={18} className="text-emerald-600" />
              Security Settings
            </CardTitle>
            <CardDescription>
              <div className="flex justify-between items-center">
                <div>Update your password to keep your account secure.</div>
                <div className="">
                  <Button onClick={() => setShowPasswordForm(true)}>
                    Change Password
                  </Button>
                </div>
              </div>
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export function PasswordChangeUI({url}: {url: string}) {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState({
    oldPass: "",
    newPass: "",
    confirmPass: "",
  });
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!password.oldPass || !password.newPass || !password.confirmPass) {
      toast.error("Please complete all password fields.");
      return;
    }

    if (password.newPass !== password.confirmPass) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(password),
    });
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message || "Failed to allocate course");
    }
    setPassword({
      oldPass: "",
      newPass: "",
      confirmPass: "",
    });
    setLoading(false);
    toast.success("Password update request sent.");
  };
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="max-w-125 gap-3 border border-zinc-500 p-4 rounded-md bg-gray-600/50">
        <div className="flex flex-col items-center justify-center gap-3 mb-3">
          <div className="">
            <Lock
              size={50}
              className="rounded-full bg-black p-2 text-emerald-600"
            />
          </div>
          <div>Change Password</div>
          <div>
            Enter your new password below. make sure it is a strong and secure
            password. Avoid using easily guessable information such as your name
            or birthdate.
          </div>
        </div>

        <div>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="mb-4">
              <Label className="mb-2">Old Password</Label>
              <Input
                type="password"
                placeholder="Enter Your Old Password"
                value={password.oldPass}
                onChange={(e) =>
                  setPassword((prev) => ({ ...prev, oldPass: e.target.value }))
                }
                required
              />
            </div>
            <div className="mb-4">
              <Label className="mb-2">Confirm New Password</Label>
              <Input
                type="password"
                placeholder="Enter Your New Password"
                value={password.newPass}
                onChange={(e) =>
                  setPassword((prev) => ({ ...prev, newPass: e.target.value }))
                }
                required
              />
            </div>
            <div className="mb-4">
              <Label className="mb-2">Confirm New Password</Label>
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={password.confirmPass}
                onChange={(e) =>
                  setPassword((prev) => ({
                    ...prev,
                    confirmPass: e.target.value,
                  }))
                }
                required
              />
            </div>
            <Button type="submit" disabled={loading} className={"w-full"}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LecturerProfile;
