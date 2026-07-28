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
import { LogOut, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { menuConfig } from "@/config/menu.config"
import Logo from "@/assets/images/srm_logo.png"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function AppSidebar() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const location = useLocation()
  const navigate = useNavigate()

  // ✅ Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('user')
    toast.success('Logged out successfully')
    navigate('/login')
  }

  // Checks if a url matches the current route
  const isUrlActive = (url: string) => location.pathname === url

  // Checks if any child of a parent item is active
  const isParentActive = (item: any) =>
    item.items?.some((sub: any) => isUrlActive(sub.url))

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-3 font-bold border-b flex justify-start items-start gap-2 overflow-hidden">
        <div>
          <img src={Logo} className="w-auto h-[40px]" alt="" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuConfig.map((item) => {
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
                    defaultOpen={parentActive}
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
                            <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
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