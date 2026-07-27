import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Bell, MessageCircle, Heart, UserPlus, AtSign, CheckCheck, Inbox } from "lucide-react"
import { cn } from "@/lib/utils"

interface NotificationItem {
  id: number
  type: "comment" | "like" | "follow" | "mention"
  author: string
  username: string
  initials: string
  message: string
  time: string
  unread: boolean
}

// ✅ Fixed: Unique IDs for all notifications
const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    type: "comment",
    author: "Sarah Anderson",
    username: "@sarahanderson",
    initials: "SA",
    message: "commented on your post",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: 2,
    type: "like",
    author: "Mike Johnson",
    username: "@mikej",
    initials: "MJ",
    message: "liked your article",
    time: "4 hours ago",
    unread: true,
  },
  {
    id: 3,
    type: "follow",
    author: "Emily Chen",
    username: "@emilychen",
    initials: "EC",
    message: "started following you",
    time: "1 day ago",
    unread: false,
  },
  {
    id: 4,
    type: "mention",
    author: "David Brown",
    username: "@davidb",
    initials: "DB",
    message: "mentioned you in a comment",
    time: "2 days ago",
    unread: false,
  },
  {
    id: 5,
    type: "comment",
    author: "Sarah Anderson",
    username: "@sarahanderson",
    initials: "SA",
    message: "commented on your post",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: 6,
    type: "like",
    author: "Mike Johnson",
    username: "@mikej",
    initials: "MJ",
    message: "liked your article",
    time: "4 hours ago",
    unread: true,
  },
  {
    id: 7,
    type: "follow",
    author: "Emily Chen",
    username: "@emilychen",
    initials: "EC",
    message: "started following you",
    time: "1 day ago",
    unread: false,
  },
  {
    id: 8,
    type: "mention",
    author: "David Brown",
    username: "@davidb",
    initials: "DB",
    message: "mentioned you in a comment",
    time: "2 days ago",
    unread: false,
  },
  {
    id: 9,
    type: "comment",
    author: "Sarah Anderson",
    username: "@sarahanderson",
    initials: "SA",
    message: "commented on your post",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: 10,
    type: "like",
    author: "Mike Johnson",
    username: "@mikej",
    initials: "MJ",
    message: "liked your article",
    time: "4 hours ago",
    unread: true,
  },
  {
    id: 11,
    type: "follow",
    author: "Emily Chen",
    username: "@emilychen",
    initials: "EC",
    message: "started following you",
    time: "1 day ago",
    unread: false,
  },
  {
    id: 12,
    type: "mention",
    author: "David Brown",
    username: "@davidb",
    initials: "DB",
    message: "mentioned you in a comment",
    time: "2 days ago",
    unread: false,
  },
]

const typeStyles: Record<NotificationItem["type"], { icon: React.ReactNode; bg: string }> = {
  comment: { icon: <MessageCircle className="h-4 w-4" />, bg: "bg-blue-100 text-blue-600" },
  like: { icon: <Heart className="h-4 w-4" />, bg: "bg-red-100 text-red-600" },
  follow: { icon: <UserPlus className="h-4 w-4" />, bg: "bg-green-100 text-green-600" },
  mention: { icon: <AtSign className="h-4 w-4" />, bg: "bg-purple-100 text-purple-600" },
}

const NotificationPanel = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications)
  const unreadCount = notifications.filter((n) => n.unread).length

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger >
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] bg-red-600 hover:bg-red-700 border-none flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-[400px] flex flex-col p-0 h-screen">
        {/* Fixed Header */}
        <SheetHeader className="border-b px-4 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            {/* {unreadCount > 0 && (
              <Badge variant="secondary" className="font-normal">
                {unreadCount} unread
              </Badge>
            )} */}
          </div>
          <SheetDescription>
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "You're all caught up"}
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Content */}
        {notifications.length > 0 ? (
          <ScrollArea className="flex-1 h-full">
            <div className="flex flex-col gap-2 p-3">
              {notifications.map((notification) => {
                const style = typeStyles[notification.type]
                return (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={cn(
                      "flex gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent cursor-pointer",
                      notification.unread && "bg-muted/50 border-muted-foreground/20"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-9 flex-shrink-0 items-center justify-center rounded-full",
                        style.bg
                      )}
                    >
                      {style.icon}
                    </div>
                    <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-sm truncate">
                              {notification.author}
                            </span>
                            <span className="text-muted-foreground text-xs truncate">
                              {notification.username}
                            </span>
                          </div>
                          <span className="text-muted-foreground text-xs">
                            {notification.message}
                          </span>
                        </div>
                        {notification.unread && (
                          <div className="mt-1 size-2 flex-shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      <span className="text-muted-foreground text-xs mt-0.5">
                        {notification.time}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 p-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Inbox className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No notifications</p>
            <p className="text-xs text-muted-foreground">
              You're all caught up for now
            </p>
          </div>
        )}

        {/* Fixed Footer */}
        {notifications.length > 0 && (
          <div className="border-t px-4 py-3 shrink-0">
            <Button
              className="w-full gap-2"
              variant="outline"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck className="h-4 w-4" />
              Mark All as Read
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default NotificationPanel