"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PasswordStrength } from "@/components/ui/password-strength"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Settings, User, Lock, Camera, Save, Upload, Eye, EyeOff } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { validatePasswordStrength } from "@/lib/password-utils"

interface UserProfile {
  name: string
  email: string
  bio: string
  profilePicture: string
}

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    bio: "",
    profilePicture: "",
  })
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user) {
        try {
          const response = await fetch("/api/user/profile")
          if (response.ok) {
            const userData = await response.json()
            setProfile({
              name: userData.name || session.user.name || "",
              email: userData.email || session.user.email || "",
              bio: userData.bio || "",
              profilePicture: userData.profilePicture || session.user.image || "",
            })
          } else {
            // Fallback to session data
            setProfile({
              name: session.user.name || "",
              email: session.user.email || "",
              bio: "",
              profilePicture: session.user.image || "",
            })
          }
        } catch (error) {
          console.error("Error fetching profile:", error)
          // Fallback to session data
          setProfile({
            name: session.user.name || "",
            email: session.user.email || "",
            bio: "",
            profilePicture: session.user.image || "",
          })
        }
      }
    }

    fetchProfile()
  }, [session])

  const handleProfileUpdate = async () => {
    setIsUpdatingProfile(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      })

      if (response.ok) {
        await update({ name: profile.name })
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        })
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      })
      return
    }

    const passwordStrength = validatePasswordStrength(passwordForm.newPassword)
    if (!passwordStrength.isValid) {
      toast({
        title: "Password Too Weak",
        description: "Password does not meet strength requirements.",
        variant: "destructive",
      })
      return
    }

    setIsChangingPassword(true)
    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      if (response.ok) {
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
        toast({
          title: "Password Changed",
          description: "Your password has been successfully updated.",
        })
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to change password")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to change password.",
        variant: "destructive",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append("image", file)

      const response = await fetch("/api/user/upload-avatar", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const { imageUrl } = await response.json()
        setProfile({ ...profile, profilePicture: imageUrl })
        await update({ image: imageUrl })
        toast({
          title: "Profile Picture Updated",
          description: "Your profile picture has been successfully updated.",
        })
      } else {
        throw new Error("Failed to upload image")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingImage(false)
    }
  }

  const passwordStrength = validatePasswordStrength(passwordForm.newPassword)
  const isPasswordFormValid = passwordForm.currentPassword && 
    passwordStrength.isValid && 
    passwordForm.newPassword === passwordForm.confirmPassword

  return (
    <>
      <ProgressBar 
        isLoading={isUpdatingProfile || isChangingPassword || isUploadingImage}
        title={isUpdatingProfile ? "Updating profile..." : 
               isChangingPassword ? "Changing password..." : 
               isUploadingImage ? "Uploading image..." : ""}
      />
      
      <div className="flex flex-col gap-4">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Account Settings</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Welcome Section */}
        <div className="px-4">
          <div className="rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 p-6">
            <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Settings className="w-6 h-6 text-primary" />
              Account Settings
            </h1>
            <p className="text-muted-foreground">Manage your profile information, security settings, and preferences.</p>
          </div>
        </div>

        {/* Settings Tabs */}
        <div className="px-4">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </TabsTrigger>
              <TabsTrigger value="picture" className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Picture
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal information and bio.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      className="min-h-[100px]"
                    />
                    <p className="text-sm text-muted-foreground">
                      Brief description for your profile. Maximum 500 characters.
                    </p>
                  </div>
                  <Button onClick={handleProfileUpdate} disabled={isUpdatingProfile} className="w-full md:w-auto">
                    {isUpdatingProfile ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Update Profile
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Password Tab */}
            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your password to keep your account secure.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        placeholder="Enter your current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="Enter your new password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {passwordForm.newPassword && (
                      <PasswordStrength password={passwordForm.newPassword} />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        placeholder="Confirm your new password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                      <p className="text-sm text-red-500">Passwords do not match</p>
                    )}
                  </div>
                  <Button
                    onClick={handlePasswordChange}
                    disabled={isChangingPassword || !isPasswordFormValid}
                    className="w-full md:w-auto"
                  >
                    {isChangingPassword ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Changing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Change Password
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Picture Tab */}
            <TabsContent value="picture">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription>Upload a new profile picture. Recommended size: 400x400px.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profile.profilePicture || "/placeholder.svg"} alt={profile.name} />
                      <AvatarFallback className="text-2xl">{profile.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Maximum file size: 5MB.</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById("avatar-upload")?.click()}
                          disabled={isUploadingImage}
                        >
                          {isUploadingImage ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload New Picture
                            </>
                          )}
                        </Button>
                        {profile.profilePicture && (
                          <Button
                            variant="outline"
                            onClick={() => setProfile({ ...profile, profilePicture: "" })}
                            disabled={isUploadingImage}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
