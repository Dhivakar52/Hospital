import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, ChevronRight, Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { menuConfig } from "@/config/menu.config"
import Logo from "@/assets/images/full-logo.png"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"

export function AppSidebar() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [search, setSearch] = React.useState("")
  const isSearching = search.trim().length > 0

  // Checks if a url matches the current route or sub-route
  const isUrlActive = (url: string) => {
    if (location.pathname === url) return true;
    if (url === "/registered-patients" && location.pathname.startsWith("/op/registration")) return true;
    if (url === "/revisit-records" && (location.pathname === "/op/revisit" || location.pathname.startsWith("/op/revisit/"))) return true;
    if (url === "/op/revisit-cancellation" && location.pathname.startsWith("/op/revisit-cancellation")) return true;
    if (url === "/registered-anc-records" && location.pathname.startsWith("/antenatal-registration")) return true;
    if (url === "/hospital-master-records" && location.pathname.startsWith("/hospital-master")) return true;
    if (url === "/referral-master-records" && location.pathname.startsWith("/referral-master")) return true;
    return false;
  }

  // Checks if any child of a parent item is active
  const isParentActive = (item: any) =>
    item.items?.some((sub: any) => isUrlActive(sub.url))

  // ✅ Explicit open-state map, keyed by item title.
  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    menuConfig.forEach((item) => {
      if (item.items && isParentActive(item)) {
        initial[item.title] = true
      }
    })
    return initial
  })

  // ✅ Auto-expand parent menu when route changes
  React.useEffect(() => {
    menuConfig.forEach((item) => {
      if (item.items && isParentActive(item)) {
        setOpenItems((prev) => ({ ...prev, [item.title]: true }))
      }
    })
  }, [location.pathname])

  const toggleItem = (title: string, next: boolean) => {
    setOpenItems((prev) => ({ ...prev, [title]: next }))
  }

  // ✅ Search filtering — case-insensitive match against a
  // top-level item's own title, or any of its submenu titles.
  // When a match comes only from submenu items, only those
  // matching submenu items are shown (parent still shown as the
  // group header so context isn't lost).
  const filteredMenu = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return menuConfig

    return menuConfig
      .map((item) => {
        const titleMatches = item.title.toLowerCase().includes(q)

        if (!item.items) {
          return titleMatches ? item : null
        }

        const matchingSubs = item.items.filter((sub: any) =>
          sub.title.toLowerCase().includes(q)
        )

        if (titleMatches) {
          // Parent matched — show it with all its original subitems
          return item
        }
        if (matchingSubs.length > 0) {
          // Only some subitems matched — show just those
          return { ...item, items: matchingSubs }
        }
        return null
      })
      .filter(Boolean) as typeof menuConfig
  }, [search])

  const hasResults = filteredMenu.length > 0

  // ✅ Logout Handler - uses AuthContext so isAuthenticated updates
  // immediately everywhere, instead of only in localStorage
  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-3 font-bold bg-[#14213D] border-b flex justify-start items-start gap-2 overflow-hidden"
        >
        <div>
          <img src={Logo} className="w-auto h-[40px]" alt="" />
        </div>
      </SidebarHeader>

  
      <div className="px-3 pt-3 group-data-[collapsible=icon]:hidden">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu"
            className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-7 text-[12.5px] outline-none placeholder:text-muted-foreground focus:border-slate-400"
          />
          {isSearching && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {isSearching && !hasResults ? (
              <div className="px-3 py-4 text-[12.5px] text-muted-foreground group-data-[collapsible=icon]:hidden">
                No menu items match "{search}"
              </div>
            ) : (
              <SidebarMenu>
                {filteredMenu.map((item) => {
                  // No submenu — plain link
                  if (!item.items) {
                    const isActive = isUrlActive(item.url)
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          tooltip={item.title}
                          className={cn(
                            "px-4 py-[18px] mb-[5px]",
                            isActive && "theme-color"
                          )}
                        >
                          <NavLink to={item.url} className="flex items-center gap-2 w-full">
                            <item.icon className="h-4 w-4 shrink-0" />
                            <span className="group-data-[collapsible=icon]:hidden">
                              {item.title}
                            </span>
                            {item.badge && (
                              <Badge className="ml-auto group-data-[collapsible=icon]:hidden">
                                {item.badge}
                              </Badge>
                            )}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  }

                  const parentActive = isParentActive(item)
                  // While searching, force submenus open so matches are visible
                  const isOpen = isSearching ? true : openItems[item.title] ?? parentActive

                  // Has submenu + sidebar collapsed to icons -> popover dropdown
                  if (isCollapsed) {
                    return (
                      <SidebarMenuItem key={item.title}>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <SidebarMenuButton
                                tooltip={item.title}
                                className={cn(parentActive && "theme-color")}
                              >
                                <item.icon className="h-4 w-4 shrink-0" />
                              </SidebarMenuButton>
                            }
                          />
                          <DropdownMenuContent side="right" align="start" className="min-w-48">
                            <div className="px-2 py-1.5 text-sm font-medium">{item.title}</div>
                            {item.items.map((sub) => {
                              const subActive = isUrlActive(sub.url)
                              return (
                                <DropdownMenuItem
                                  key={sub.title}
                                  className={cn(subActive && "theme-color")}
                                  render={
                                    <NavLink to={sub.url} className="flex items-center gap-2 w-full">
                                      <sub.icon className="h-4 w-4" />
                                      <span>{sub.title}</span>
                                    </NavLink>
                                  }
                                />
                              )
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuItem>
                    )
                  }

                  // Has submenu + sidebar expanded -> inline collapsible
                  return (
                    <Collapsible
                      key={item.title}
                      open={isOpen}
                      onOpenChange={(next) => toggleItem(item.title, next)}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger
                          render={
                            <SidebarMenuButton
                              tooltip={item.title}
                              className={cn(parentActive && "theme-color")}
                            >
                              <item.icon className="h-4 w-4 shrink-0" />
                              <span className="group-data-[collapsible=icon]:hidden">
                                {item.title}
                              </span>
                              {item.badge && (
                                <Badge className="ml-auto mr-1 group-data-[collapsible=icon]:hidden">
                                  {item.badge}
                                </Badge>
                              )}
                              <ChevronRight
                                className={cn(
                                  "ml-auto h-4 w-4 transition-transform duration-200 group-data-[collapsible=icon]:hidden",
                                  isOpen && "rotate-90"
                                )}
                              />
                            </SidebarMenuButton>
                          }
                        />
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((sub) => {
                              const subActive = isUrlActive(sub.url)
                              return (
                                <SidebarMenuSubItem key={sub.title}>
                                  <SidebarMenuSubButton
                                    className={cn(subActive && "theme-color")}
                                  >
                                    <NavLink to={sub.url} className="flex items-center gap-2 w-full">
                                      <sub.icon className="h-4 w-4" />
                                      <span>{sub.title}</span>
                                    </NavLink>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              )
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                })}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ✅ Sidebar Footer with Logout */}
      <SidebarFooter className="border-t p-4">
        <SidebarMenuItem className="list-none">
          <SidebarMenuButton 
            tooltip="Logout" 
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50/10"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden">Logout</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}