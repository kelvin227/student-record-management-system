"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Phone, LogOut } from "lucide-react";
import { useState } from "react";
import { PasswordChangeUI } from "../lecturer/profileComp";
import { toast } from "sonner";
import { Logout } from "@/lib/function/authactions";

export default function SettingsView() {
  const [showForm, setShowForm] = useState(false);
  const [showNumberForm, setShowNumberForm] = useState(false);

  return showForm ? (
    <div>
      <div className="flex p-2 items-center justify-between mb-4">
        <Button variant="ghost" onClick={() => setShowForm(false)}>
          Back
        </Button>
      </div>
      <PasswordChangeUI url="/api/student/resetPassword" />
    </div>
  ) : showNumberForm ? (
    <div>
      <div className="flex p-2 items-center justify-between mb-4">
        <Button variant="ghost" onClick={() => setShowNumberForm(false)}>
          Back
        </Button>
      </div>
      <NumberChangeUI url="/api/student/resetNumber" />
    </div>
  ) : (
    <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account security and contact information.
        </p>
      </div>

      <div className="space-y-6">
        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock size={18} className="text-sky-600" /> Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Update your password to keep your account secure.</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-sky-600 hover:bg-sky-700"
            >
              Update Password
            </Button>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone size={18} className="text-sky-600" /> Update Phone Number
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p>Update your phone number.</p>
            </div>
            <Button onClick={() => setShowNumberForm(true)} variant="outline">
              Update Phone Number
            </Button>
          </CardContent>
        </Card>

        {/* Logout Section */}
        <div className="pt-4 border-t">
          <Button
            onClick={() => Logout("/students/login")}
            variant="ghost"
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 w-full justify-start gap-2"
          >
            <LogOut size={18} /> Logout
          </Button>
        </div>
      </div>
    </div>
  );
}

export function NumberChangeUI({ url }: { url: string }) {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState({
    number: "",
    confirmPass: "",
  });
  const handleNumberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!password.number || !password.confirmPass) {
      toast.error("Please complete all fields.");
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
      toast.error(data.message || "Failed to update number");
    }
    setPassword({
      number: "",
      confirmPass: "",
    });
    setLoading(false);
    toast.success("phone number update request sent.");
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
          <div>Change your Phone Number</div>
          <div>
            Enter your new Phone numbrt below. make sure the phone number you
            use is yours, the school authority will contact you with your set
            phone number
          </div>
        </div>

        <div>
          <form onSubmit={handleNumberSubmit} className="space-y-4">
            <div className="mb-4">
              <Label className="mb-2">New Phone number</Label>
              <Input
                type="number"
                placeholder="Enter Your New Number"
                value={password.number}
                onChange={(e) =>
                  setPassword((prev) => ({ ...prev, number: e.target.value }))
                }
                required
              />
            </div>
            <div className="mb-4">
              <Label className="mb-2">Enter Password</Label>
              <Input
                type="password"
                placeholder="Enter Your Password"
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
