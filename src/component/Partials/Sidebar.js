import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TaskIcon from "@mui/icons-material/Task";
import AssignmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import BuildIcon from "@mui/icons-material/Build";
import EngineeringIcon from "@mui/icons-material/Engineering";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import SolarPowerIcon from "@mui/icons-material/SolarPower";
import Avatar from "@mui/joy/Avatar";
import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import GlobalStyles from "@mui/joy/GlobalStyles";
import IconButton from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemButton, { listItemButtonClasses } from "@mui/joy/ListItemButton";
import ListItemContent from "@mui/joy/ListItemContent";
import Sheet from "@mui/joy/Sheet";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Main_Logo from "../../assets/protrac_diwali.png";
import { closeSidebar } from "../../utils/utils";
import DatabaseIcon from "@mui/icons-material/Storage";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import AppNotification from "./Notification";

function Toggler({ defaultExpanded = false, renderToggle, children }) {
  const [open, setOpen] = useState(defaultExpanded);
  return (
    <>
      {renderToggle({ open, setOpen })}
      <Box
        sx={[
          {
            display: "grid",
            transition: "0.2s ease",
            "& > *": {
              overflow: "hidden",
            },
          },
          open ? { gridTemplateRows: "1fr" } : { gridTemplateRows: "0fr" },
        ]}
      >
        {children}
      </Box>
    </>
  );
}

function Sidebar() {
  const navigate = useNavigate();
  // const { mode } = useColorScheme();
  const [user, setUser] = useState(null);
  const [subscribeId, setSubscribeId] = useState("");
  const location = useLocation();
  useEffect(() => {
    const userData = getUserData();
    setSubscribeId(userData.userID);
    setUser(userData);
  }, []);

  const getUserData = () => {
    const userData = localStorage.getItem("userDetails");

    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const isSalesPage = location.pathname === "/sales";
  const isProjectsPage =
    location.pathname === "/view_pm" ||
    location.pathname === "/email" ||
    location.pathname === "/email_template";
  return (
    <Sheet
      className="Sidebar"
      sx={{
        position: "fixed",
        transition: "transform 0.4s, width 0.4s",
        zIndex: { xs: 201, lg: 202 },
        height: "100dvh",
        width: "var(--Sidebar-width)",
        top: 0,
        p: 2,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        borderRight: "1px solid",
        borderColor: "divider",
        "@media print": { display: "none" },
        transform: {
          xs: "translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))",
          lg:
            isSalesPage || isProjectsPage
              ? "translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))"
              : "none",
        },
      }}
    >
      <GlobalStyles
        styles={(theme) => ({
          ":root": {
            "--Sidebar-width": "240px",
            [theme.breakpoints.up("lg")]: {
              "--Sidebar-width": "240px",
            },
          },
        })}
      />
      <Box
        className="Sidebar-overlay"
        sx={{
          position: "fixed",
          zIndex: 202,
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          opacity: "var(--SideNavigation-slideIn)",
          backgroundColor: "var(--joy-palette-background-backdrop)",
          transition: "opacity 0.4s",
          transform: {
            xs: "translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1) + var(--SideNavigation-slideIn, 0) * var(--Sidebar-width, 0px)))",
            sm: "translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1) + var(--SideNavigation-slideIn, 0) * var(--Sidebar-width, 0px)))",
            md: "translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1) + var(--SideNavigation-slideIn, 0) * var(--Sidebar-width, 0px)))",
            lg:
              isSalesPage || isProjectsPage
                ? "translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1) + var(--SideNavigation-slideIn, 0) * var(--Sidebar-width, 0px)))"
                : "translateX(-100%)",
          },
        }}
        onClick={() => closeSidebar()}
      />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          position: "relative",
          gap: 10,
        }}
      >
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <IconButton variant="soft" color="primary" size="sm">
            <img
              src={Main_Logo}
              alt="Protrac"
              style={{ width: "70px", height: "64px" }}
            />
          </IconButton>
        </Box>
        <Box
          sx={{
            zIndex: 200000,
            position: "relative",
            display: { xs: "none", sm: "none", md: "none", lg: "block" },
          }}
        >
          <AppNotification />
        </Box>
      </Box>

      <Input
        size="sm"
        startDecorator={<SearchRoundedIcon />}
        placeholder="Search"
      />
      <Box
        sx={{
          minHeight: 0,
          overflow: "hidden auto",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          [`& .${listItemButtonClasses.root}`]: {
            gap: 1.5,
          },
        }}
      >
        {user?.name === "IT Team" || user?.department === "admin" ? (
          <List>
            <ListItem>
              <ListItemButton>
                <HomeRoundedIcon />
                <ListItemContent>
                  <Typography
                    level="title-sm"
                    onClick={() => navigate("/dashboard")}
                  >
                    Home
                  </Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <AssignmentRoundedIcon />
                    <ListItemContent>
                      <Typography level="title-sm">BD</Typography>
                    </ListItemContent>
                    <KeyboardArrowDownIcon
                      sx={[
                        open
                          ? {
                            transform: "rotate(180deg)",
                          }
                          : {
                            transform: "none",
                          },
                      ]}
                    />
                  </ListItemButton>
                )}
              >
                <List sx={{ gap: 0.5 }}>
                  <ListItem>
                    <ListItemButton
                      onClick={() =>
                        navigate("/sales", {
                          state: { internalPath: "/dashboard", search: "" },
                        })
                      }
                    >
                      Dashboard
                    </ListItemButton>
                  </ListItem>

                  <ListItem>
                    <ListItemButton onClick={() => navigate("/comm_offer")}>
                      Commercial Offer
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <AccountBalanceIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Accounting</Typography>
                    </ListItemContent>
                    <KeyboardArrowDownIcon
                      sx={[
                        open
                          ? {
                            transform: "rotate(180deg)",
                          }
                          : {
                            transform: "none",
                          },
                      ]}
                    />
                  </ListItemButton>
                )}
              >
                <List sx={{ gap: 0.5 }}>
                  <ListItem sx={{ mt: 0.5 }}>
                    <ListItemButton
                      onClick={() => navigate("/project-balance")}
                    >
                      Project Balances
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton
                      onClick={() => navigate("/daily-payment-request")}
                    >
                      Daily Payment Request
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton
                      onClick={() => navigate("/payment-approval")}
                    >
                      Payment Approval
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton
                      onClick={() => navigate("/payment-approved")}
                    >
                      Approved Payment
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/handover_dash")}>
                <SettingsSuggestIcon />
                <ListItemContent>
                  <Typography level="title-sm">Internal Operation</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/cam_dash")}>
                <MiscellaneousServicesIcon />
                <ListItemContent>
                  <Typography level="title-sm">CAM</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/eng_dash")}>
                <SolarPowerIcon />
                <ListItemContent>
                  <Typography level="title-sm">Engineering</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/purchase-order")}>
                <EngineeringIcon />
                <ListItemContent>
                  <Typography level="title-sm">SCM</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/project_dash")}>
                <BuildIcon />
                <ListItemContent>
                  <Typography level="title-sm">Projects</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/expense_dashboard")}>
                <AccountBalanceWalletIcon />
                <ListItemContent>
                  <Typography level="title-sm">Expense Sheet</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/task_dashboard")}>
                <TaskIcon />
                <ListItemContent>
                  <Typography level="title-sm">Task</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/categories")}>
                <DatabaseIcon />
                <ListItemContent>
                  <Typography level="title-sm">My Databases</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/approval_dashboard")}>
                <FactCheckIcon />
                <ListItemContent>
                  <Typography level="title-sm">Approvals</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
          </List>
        ) : user?.department === "Accounts" &&
          (user?.name === "Deepak Kumar Maurya" ||
            user?.name === "Gagan Tayal" ||
            user?.name === "Ajay Singh" ||
            user?.name === "Sachin Raghav" ||
            user?.name === "Anamika Poonia" ||
            user?.name === "Meena Verma" ||
            user?.name === "Kailash Chand" ||
            user?.name === "Chandan Singh") ? (
          <List
            size="sm"
            sx={{
              gap: 1,
              "--List-nestedInsetStart": "30px",
              "--ListItem-radius": (theme) => theme.vars.radius.sm,
            }}
          >
            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <AccountBalanceIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Accounting</Typography>
                    </ListItemContent>
                    <KeyboardArrowDownIcon
                      sx={[
                        open
                          ? {
                            transform: "rotate(180deg)",
                          }
                          : {
                            transform: "none",
                          },
                      ]}
                    />
                  </ListItemButton>
                )}
              >
                {user?.name === "Sachin Raghav" && (
                  <List
                    size="sm"
                    sx={{
                      gap: 1,
                      "--List-nestedInsetStart": "30px",
                      "--ListItem-radius": (theme) => theme.vars.radius.sm,
                    }}
                  >
                    <ListItem>
                      <ListItemButton
                        onClick={() => navigate("/project-balance")}
                      >
                        <AccountBalanceIcon />
                        <ListItemContent>
                          <Typography level="title-sm">
                            Project Balances
                          </Typography>
                        </ListItemContent>
                      </ListItemButton>
                    </ListItem>
                  </List>
                )}

                <List sx={{ gap: 0.5 }}>
                  <ListItem>
                    <ListItemButton
                      onClick={() => navigate("/project-balance")}
                    >
                      Project Balances
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton
                      onClick={() => navigate("/daily-payment-request")}
                    >
                      Daily Payment Request
                    </ListItemButton>
                  </ListItem>
                  {user?.name === "Chandan Singh" && (
                    <ListItem>
                      <ListItemButton
                        onClick={() => navigate("/payment-approval")}
                      >
                        Payment Approval
                      </ListItemButton>
                    </ListItem>
                  )}
                  <ListItem>
                    <ListItemButton
                      onClick={() => navigate("/payment-approved")}
                    >
                      Approved Payment
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <EngineeringIcon />
                    <ListItemContent>
                      <Typography level="title-sm">SCM</Typography>
                    </ListItemContent>
                    <KeyboardArrowDownIcon
                      sx={[
                        open
                          ? {
                            transform: "rotate(180deg)",
                          }
                          : {
                            transform: "none",
                          },
                      ]}
                    />
                  </ListItemButton>
                )}
              >
                <List sx={{ gap: 0.5 }}>
                  <ListItem sx={{ mt: 0.5 }}>
                    <ListItemButton onClick={() => navigate("/purchase-order")}>
                      Purchase Order
                    </ListItemButton>
                  </ListItem>

                  <ListItem>
                    <ListItemButton onClick={() => navigate("/vendor_bill")}>
                      Vendor Bill
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/expense_dashboard")}>
                <AccountBalanceWalletIcon />
                <ListItemContent>
                  <Typography level="title-sm">Expense Sheet</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/task_dashboard")}>
                <TaskIcon />
                <ListItemContent>
                  <Typography level="title-sm">Task</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
          </List>
        ) : user?.department === "BD" ? (
          <List>
            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <AssignmentRoundedIcon />
                    <ListItemContent>
                      <Typography level="title-sm">BD</Typography>
                    </ListItemContent>
                    <KeyboardArrowDownIcon
                      sx={[
                        open
                          ? {
                            transform: "rotate(180deg)",
                          }
                          : {
                            transform: "none",
                          },
                      ]}
                    />
                  </ListItemButton>
                )}
              >
                <List sx={{ gap: 0.5 }}>
                  <ListItem>
                    <ListItemButton
                      onClick={() =>
                        navigate("/sales", {
                          state: { internalPath: "/dashboard", search: "" },
                        })
                      }
                    >
                      Dashboard
                    </ListItemButton>
                  </ListItem>

                  <ListItem>
                    <ListItemButton onClick={() => navigate("/comm_offer")}>
                      Commercial Offer
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/expense_dashboard")}>
                <AccountBalanceWalletIcon />
                <ListItemContent>
                  <Typography level="title-sm">Expense Sheet</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/task_dashboard")}>
                <TaskIcon />
                <ListItemContent>
                  <Typography level="title-sm">Task</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
          </List>
        ) : user?.department === "Accounts" &&
          user?.name === "Sujan Maharjan" ? (
          <List
            size="sm"
            sx={{
              gap: 1,
              "--List-nestedInsetStart": "30px",
              "--ListItem-radius": (theme) => theme.vars.radius.sm,
            }}
          >
            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <AccountBalanceIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Accounting</Typography>
                    </ListItemContent>
                    <KeyboardArrowDownIcon
                      sx={[
                        open
                          ? {
                            transform: "rotate(180deg)",
                          }
                          : {
                            transform: "none",
                          },
                      ]}
                    />
                  </ListItemButton>
                )}
              >
                <List sx={{ gap: 0.5 }}>
                  <ListItem sx={{ mt: 0.5 }}>
                    <ListItemButton
                      onClick={() => navigate("/project-balance")}
                    >
                      Project Balances
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton
                      onClick={() => navigate("/daily-payment-request")}
                    >
                      Daily Payment Request
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton
                      onClick={() => navigate("/payment-approval")}
                    >
                      Payment Approval
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton
                      onClick={() => navigate("/payment-approved")}
                    >
                      Approved Payment
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/purchase-order")}>
                <EngineeringIcon />
                <ListItemContent>
                  <Typography level="title-sm">SCM</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/task_dashboard")}>
                <TaskIcon />
                <ListItemContent>
                  <Typography level="title-sm">Task</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/expense_dashboard")}>
                <AccountBalanceWalletIcon />
                <ListItemContent>
                  <Typography level="title-sm">Expense Sheet</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
          </List>
        ) : user?.name === "Guddu Rani Dubey" ||
          user?.name === "Varun Mishra" ||
          user?.name === "Prachi Singh" ? (
          <List
            size="sm"
            sx={{
              gap: 1,
              "--List-nestedInsetStart": "30px",
              "--ListItem-radius": (theme) => theme.vars.radius.sm,
            }}
          >
            {/*BD*/}
            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <AssignmentRoundedIcon />
                    <ListItemContent>
                      <Typography level="title-sm">BD</Typography>
                    </ListItemContent>
                    <KeyboardArrowDownIcon
                      sx={[
                        open
                          ? {
                            transform: "rotate(180deg)",
                          }
                          : {
                            transform: "none",
                          },
                      ]}
                    />
                  </ListItemButton>
                )}
              >
                <List sx={{ gap: 0.5 }}>
                  <ListItem>
                    <ListItemButton
                      onClick={() =>
                        navigate("/sales", {
                          state: { internalPath: "/dashboard", search: "" },
                        })
                      }
                    >
                      Dashboard
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>
            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <AccountBalanceIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Accounting</Typography>
                    </ListItemContent>
                    <KeyboardArrowDownIcon
                      sx={[
                        open
                          ? {
                            transform: "rotate(180deg)",
                          }
                          : {
                            transform: "none",
                          },
                      ]}
                    />
                  </ListItemButton>
                )}
              >
                <List sx={{ gap: 0.5 }}>
                  <ListItem sx={{ mt: 0.5 }}>
                    <ListItemButton
                      onClick={() => navigate("/project-balance")}
                    >
                      Project Balances
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton
                      onClick={() => navigate("/daily-payment-request")}
                    >
                      Daily Payment Request
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton
                      onClick={() => navigate("/payment-approval")}
                    >
                      Payment Approval
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton
                      onClick={() => navigate("/payment-approved")}
                    >
                      Approved Payment
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>
            {/* CAM */}
            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/cam_dash")}>
                <MiscellaneousServicesIcon />
                <ListItemContent>
                  <Typography level="title-sm">CAM</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            {/* SCM Section */}
            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/purchase-order")}>
                <EngineeringIcon />
                <ListItemContent>
                  <Typography level="title-sm">SCM</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            {/* Projects Section */}
            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/project_dash")}>
                <BuildIcon />
                <ListItemContent>
                  <Typography level="title-sm">Projects</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/task_dashboard")}>
                <TaskIcon />
                <ListItemContent>
                  <Typography level="title-sm">Task</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <DatabaseIcon />
                    <ListItemContent>
                      <Typography level="title-sm">My Databases</Typography>
                    </ListItemContent>
                    <KeyboardArrowDownIcon
                      sx={[
                        open
                          ? {
                            transform: "rotate(180deg)",
                          }
                          : {
                            transform: "none",
                          },
                      ]}
                    />
                  </ListItemButton>
                )}
              >
                <List sx={{ gap: 0.5 }}>
                  <ListItem sx={{ mt: 0.5 }}>
                    <ListItemButton onClick={() => navigate("/products")}>
                      Products
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            {/* Ops Section */}
            {user?.name === "Prachi Singh" && (
              <ListItem sx={{ mt: 0.5 }}>
                <ListItemButton onClick={() => navigate("/handover_dash")}>
                  <SettingsSuggestIcon />
                  <ListItemContent>
                    <Typography level="title-sm">Internal Operation</Typography>
                  </ListItemContent>
                </ListItemButton>
              </ListItem>
            )}

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/expense_dashboard")}>
                <AccountBalanceWalletIcon />
                <ListItemContent>
                  <Typography level="title-sm">Expense Sheet</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
          </List>
        ) : user?.role === "purchase" ? (
          <List
            size="sm"
            sx={{
              gap: 1,
              "--List-nestedInsetStart": "30px",
              "--ListItem-radius": (theme) => theme.vars.radius.sm,
            }}
          >
            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <AccountBalanceIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Accounting</Typography>
                    </ListItemContent>
                    <KeyboardArrowDownIcon
                      sx={[
                        open
                          ? {
                            transform: "rotate(180deg)",
                          }
                          : {
                            transform: "none",
                          },
                      ]}
                    />
                  </ListItemButton>
                )}
              >
                <List sx={{ gap: 0.5 }}>
                  {user?.name === "Shubham Gupta" && (
                    <ListItem sx={{ mt: 0.5 }}>
                      <ListItemButton
                        onClick={() => navigate("/project-balance")}
                      >
                        Project Balances
                      </ListItemButton>
                    </ListItem>
                  )}
                  <ListItem>
                    <ListItemButton
                      onClick={() => navigate("/daily-payment-request")}
                    >
                      Daily Payment Request
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/cam_dash")}>
                <MiscellaneousServicesIcon />
                <ListItemContent>
                  <Typography level="title-sm">CAM</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            {/* SCM Section */}
            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/purchase-order")}>
                <EngineeringIcon />
                <ListItemContent>
                  <Typography level="title-sm">SCM</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/expense_dashboard")}>
                <AccountBalanceWalletIcon />
                <ListItemContent>
                  <Typography level="title-sm">Expense Sheet</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/task_dashboard")}>
                <TaskIcon />
                <ListItemContent>
                  <Typography level="title-sm">Task</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
          </List>
        ) : user?.role === "manager" && user?.name === "Naresh Kumar" ? (
          <List
            size="sm"
            sx={{
              gap: 1,
              "--List-nestedInsetStart": "30px",
              "--ListItem-radius": (theme) => theme.vars.radius.sm,
            }}
          >
            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <AccountBalanceIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Accounting</Typography>
                    </ListItemContent>
                    <KeyboardArrowDownIcon
                      sx={[
                        open
                          ? {
                            transform: "rotate(180deg)",
                          }
                          : {
                            transform: "none",
                          },
                      ]}
                    />
                  </ListItemButton>
                )}
              >
                <List>
                  <ListItem>
                    <ListItemButton
                      onClick={() => navigate("/daily-payment-request")}
                    >
                      Daily Payment Request
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton
                      onClick={() => navigate("/project-balance")}
                    >
                      Project Balances
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/cam_dash")}>
                <MiscellaneousServicesIcon />
                <ListItemContent>
                  <Typography level="title-sm">CAM</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/purchase-order")}>
                <EngineeringIcon />
                <ListItemContent>
                  <Typography level="title-sm">SCM</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <AssignmentRoundedIcon />
                    <ListItemContent>
                      <Typography level="title-sm">BD</Typography>
                    </ListItemContent>
                    <KeyboardArrowDownIcon
                      sx={[
                        open
                          ? {
                            transform: "rotate(180deg)",
                          }
                          : {
                            transform: "none",
                          },
                      ]}
                    />
                  </ListItemButton>
                )}
              >
                <List sx={{ gap: 0.5 }}>
                  <ListItem>
                    <ListItemButton
                      onClick={() =>
                        navigate("/sales", {
                          state: { internalPath: "/dashboard", search: "" },
                        })
                      }
                    >
                      Dashboard
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/expense_dashboard")}>
                <AccountBalanceWalletIcon />
                <ListItemContent>
                  <Typography level="title-sm">Expense Sheet</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/task_dashboard")}>
                <TaskIcon />
                <ListItemContent>
                  <Typography level="title-sm">Task</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/approval_dashboard")}>
                <FactCheckIcon />
                <ListItemContent>
                  <Typography level="title-sm">Approvals</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
          </List>
        ) : user?.role === "visitor" &&
          (user?.name === "Sanjiv Kumar" ||
            user?.name === "Sushant Ranjan Dubey") ? (
          <List
            size="sm"
            sx={{
              gap: 1,
              "--List-nestedInsetStart": "30px",
              "--ListItem-radius": (theme) => theme.vars.radius.sm,
            }}
          >
            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <AccountBalanceIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Accounting</Typography>
                    </ListItemContent>
                    <KeyboardArrowDownIcon
                      sx={[
                        open
                          ? {
                            transform: "rotate(180deg)",
                          }
                          : {
                            transform: "none",
                          },
                      ]}
                    />
                  </ListItemButton>
                )}
              >
                <List sx={{ gap: 0.5 }}>
                  <ListItem sx={{ mt: 0.5 }}>
                    <ListItemButton
                      onClick={() => navigate("/project-balance")}
                    >
                      Project Balances
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton
                      onClick={() => navigate("/daily-payment-request")}
                    >
                      Daily Payment Request
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton
                      onClick={() => navigate("/payment-approval")}
                    >
                      Payment Approval
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            {/* SCM Section */}
            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/purchase-order")}>
                <EngineeringIcon />
                <ListItemContent>
                  <Typography level="title-sm">SCM</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            {/* CAM Section */}
            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/cam_dash")}>
                <MiscellaneousServicesIcon />
                <ListItemContent>
                  <Typography level="title-sm">CAM</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/project_dash")}>
                <BuildIcon />
                <ListItemContent>
                  <Typography level="title-sm">Projects</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/expense_dashboard")}>
                <AccountBalanceWalletIcon />
                <ListItemContent>
                  <Typography level="title-sm">Expense Sheet</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/task_dashboard")}>
                <TaskIcon />
                <ListItemContent>
                  <Typography level="title-sm">Task</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/approval_dashboard")}>
                <FactCheckIcon />
                <ListItemContent>
                  <Typography level="title-sm">Approvals</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
          </List>
        ) : user?.department === "CAM" && user?.name !== "Shantanu Sameer" ? (
          <List
            size="sm"
            sx={{
              gap: 1,
              "--List-nestedInsetStart": "30px",
              "--ListItem-radius": (theme) => theme.vars.radius.sm,
            }}
          >
            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <AccountBalanceIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Accounting</Typography>
                    </ListItemContent>
                    <KeyboardArrowDownIcon
                      sx={[
                        open
                          ? {
                            transform: "rotate(180deg)",
                          }
                          : {
                            transform: "none",
                          },
                      ]}
                    />
                  </ListItemButton>
                )}
              >
                <List sx={{ gap: 0.5 }}>
                  <ListItem sx={{ mt: 0.5 }}>
                    <ListItemButton
                      onClick={() => navigate("/project-balance")}
                    >
                      Project Balances
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton
                      onClick={() => navigate("/daily-payment-request")}
                    >
                      Daily Payment Request
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            {/* SCM Section */}
            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/purchase-order")}>
                <EngineeringIcon />
                <ListItemContent>
                  <Typography level="title-sm">SCM</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            {/* CAM Section */}
            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/cam_dash")}>
                <MiscellaneousServicesIcon />
                <ListItemContent>
                  <Typography level="title-sm">CAM</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/project_dash")}>
                <BuildIcon />
                <ListItemContent>
                  <Typography level="title-sm">Projects</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/expense_dashboard")}>
                <AccountBalanceWalletIcon />
                <ListItemContent>
                  <Typography level="title-sm">Expense Sheet</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/task_dashboard")}>
                <TaskIcon />
                <ListItemContent>
                  <Typography level="title-sm">Task</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/approval_dashboard")}>
                <FactCheckIcon />
                <ListItemContent>
                  <Typography level="title-sm">Approvals</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
          </List>
        ) : user?.role === "manager" && user?.name === "Ranvijay Singh" ? (
          <List
            size="sm"
            sx={{
              gap: 1,
              "--List-nestedInsetStart": "30px",
              "--ListItem-radius": (theme) => theme.vars.radius.sm,
            }}
          >
            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/eng_dash")}>
                <SolarPowerIcon />
                <ListItemContent>
                  <Typography level="title-sm">Engineering</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/project_dash")}>
                <BuildIcon />
                <ListItemContent>
                  <Typography level="title-sm">Projects</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/expense_dashboard")}>
                <AccountBalanceWalletIcon />
                <ListItemContent>
                  <Typography level="title-sm">Expense Sheet</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>


            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/task_dashboard")}>
                <TaskIcon />
                <ListItemContent>
                  <Typography level="title-sm">Task</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
          </List>
        ) : user?.role === "manager" && user?.name === "Shruti Tripathi" ? (
          <List
            size="sm"
            sx={{
              gap: 1,
              "--List-nestedInsetStart": "30px",
              "--ListItem-radius": (theme) => theme.vars.radius.sm,
            }}
          >
            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/expense_dashboard")}>
                <AccountBalanceWalletIcon />
                <ListItemContent>
                  <Typography level="title-sm">Expense Sheet</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/task_dashboard")}>
                <TaskIcon />
                <ListItemContent>
                  <Typography level="title-sm">Task</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
          </List>
        ) : user?.department === "HR" ? (
          <List
            size="sm"
            sx={{
              gap: 1,
              "--List-nestedInsetStart": "30px",
              "--ListItem-radius": (theme) => theme.vars.radius.sm,
            }}
          >
            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/expense_dashboard")}>
                <AccountBalanceWalletIcon />
                <ListItemContent>
                  <Typography level="title-sm">Expense Sheet</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>


            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/task_dashboard")}>
                <TaskIcon />
                <ListItemContent>
                  <Typography level="title-sm">Task</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
          </List>
        ) : user?.department === "Projects" ||
          user?.department === "Infra" ||
          user?.department === "Marketing" ||
          user?.department === "Internal" ||
          user?.department === "Loan" ||
          (user?.department === "CAM" && user?.name !== "Shantanu Sameer") ? (
          <>
            <List
              size="sm"
              sx={{
                gap: 1,
                "--List-nestedInsetStart": "30px",
                "--ListItem-radius": (theme) => theme.vars.radius.sm,
              }}
            >
              <ListItem sx={{ mt: 0.5 }}>
                <ListItemButton onClick={() => navigate("/expense_dashboard")}>
                  <AccountBalanceWalletIcon />
                  <ListItemContent>
                    <Typography level="title-sm">Expense Sheet</Typography>
                  </ListItemContent>
                </ListItemButton>
              </ListItem>

              <ListItem sx={{ mt: 0.5 }}>
                <ListItemButton onClick={() => navigate("/task_dashboard")}>
                  <TaskIcon />
                  <ListItemContent>
                    <Typography level="title-sm">Task</Typography>
                  </ListItemContent>
                </ListItemButton>
              </ListItem>

              <ListItem sx={{ mt: 0.5 }}>
                <ListItemButton onClick={() => navigate("/approval_dashboard")}>
                  <FactCheckIcon />
                  <ListItemContent>
                    <Typography level="title-sm">Approvals</Typography>
                  </ListItemContent>
                </ListItemButton>
              </ListItem>
              {user?.emp_id === "SE-203" && (
                <ListItem nested>
                  <Toggler
                    renderToggle={({ open, setOpen }) => (
                      <ListItemButton onClick={() => setOpen(!open)}>
                        <AccountBalanceIcon />
                        <ListItemContent>
                          <Typography level="title-sm">Accounting</Typography>
                        </ListItemContent>
                        <KeyboardArrowDownIcon
                          sx={[
                            open
                              ? {
                                transform: "rotate(180deg)",
                              }
                              : {
                                transform: "none",
                              },
                          ]}
                        />
                      </ListItemButton>
                    )}
                  >
                    <List sx={{ gap: 0.5 }}>
                      <ListItem>
                        <ListItemButton
                          onClick={() => navigate("/daily-payment-request")}
                        >
                          Daily Payment Request
                        </ListItemButton>
                      </ListItem>
                    </List>
                  </Toggler>
                </ListItem>
              )}
              {(user?.emp_id === "SE-203" ||
                user?.emp_id === "SE-212" ||
                user?.emp_id === "SE-205" ||
                user?.emp_id === "SE-010") && (
                  <>
                    <ListItem sx={{ mt: 0.5 }}>
                      <ListItemButton onClick={() => navigate("/cam_dash")}>
                        <MiscellaneousServicesIcon />
                        <ListItemContent>
                          <Typography level="title-sm">CAM</Typography>
                        </ListItemContent>
                      </ListItemButton>
                    </ListItem>
                    <ListItem sx={{ mt: 0.5 }}>
                      <ListItemButton onClick={() => navigate("/project_dash")}>
                        <BuildIcon />
                        <ListItemContent>
                          <Typography level="title-sm">Projects</Typography>
                        </ListItemContent>
                      </ListItemButton>
                    </ListItem>
                    <ListItem sx={{ mt: 0.5 }}>
                      <ListItemButton onClick={() => navigate("/eng_dash")}>
                        <SolarPowerIcon />
                        <ListItemContent>
                          <Typography level="title-sm">Engineering</Typography>
                        </ListItemContent>
                      </ListItemButton>
                    </ListItem>
                  </>
                )}
            </List>
          </>
        ) : user?.department === "Engineering" ? (
          <List>
            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/eng_dash")}>
                <SolarPowerIcon />
                <ListItemContent>
                  <Typography level="title-sm">Engineering</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/project_dash")}>
                <BuildIcon />
                <ListItemContent>
                  <Typography level="title-sm">Projects</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/expense_dashboard")}>
                <AccountBalanceWalletIcon />
                <ListItemContent>
                  <Typography level="title-sm">Expense Sheet</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/task_dashboard")}>
                <TaskIcon />
                <ListItemContent>
                  <Typography level="title-sm">Task</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
          </List>
        ) : user?.department === "CAM" && user?.name === "Shantanu Sameer" ? (
          <List
            size="sm"
            sx={{
              gap: 1,
              "--List-nestedInsetStart": "30px",
              "--ListItem-radius": (theme) => theme.vars.radius.sm,
            }}
          >
            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <AssignmentRoundedIcon />
                    <ListItemContent>
                      <Typography level="title-sm">BD</Typography>
                    </ListItemContent>
                    <KeyboardArrowDownIcon
                      sx={[
                        open
                          ? {
                            transform: "rotate(180deg)",
                          }
                          : {
                            transform: "none",
                          },
                      ]}
                    />
                  </ListItemButton>
                )}
              >
                <List sx={{ gap: 0.5 }}>
                  <ListItem>
                    <ListItemButton
                      onClick={() =>
                        navigate("/sales", {
                          state: { internalPath: "/dashboard", search: "" },
                        })
                      }
                    >
                      Dashboard
                    </ListItemButton>
                  </ListItem>

                  <ListItem>
                    <ListItemButton onClick={() => navigate("/comm_offer")}>
                      Commercial Offer
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>
            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <AccountBalanceIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Accounting</Typography>
                    </ListItemContent>
                    <KeyboardArrowDownIcon
                      sx={[
                        open
                          ? {
                            transform: "rotate(180deg)",
                          }
                          : {
                            transform: "none",
                          },
                      ]}
                    />
                  </ListItemButton>
                )}
              >
                <List sx={{ gap: 0.5 }}>
                  <ListItem sx={{ mt: 0.5 }}>
                    <ListItemButton
                      onClick={() => navigate("/project-balance")}
                    >
                      Project Balances
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton
                      onClick={() => navigate("/daily-payment-request")}
                    >
                      Daily Payment Request
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            {/* SCM Section */}
            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/purchase-order")}>
                <EngineeringIcon />
                <ListItemContent>
                  <Typography level="title-sm">SCM</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            {/* CAM Section */}
            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/cam_dash")}>
                <MiscellaneousServicesIcon />
                <ListItemContent>
                  <Typography level="title-sm">CAM</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/project_dash")}>
                <BuildIcon />
                <ListItemContent>
                  <Typography level="title-sm">Projects</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/expense_dashboard")}>
                <AccountBalanceWalletIcon />
                <ListItemContent>
                  <Typography level="title-sm">Expense Sheet</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/task_dashboard")}>
                <TaskIcon />
                <ListItemContent>
                  <Typography level="title-sm">Task</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/approval_dashboard")}>
                <FactCheckIcon />
                <ListItemContent>
                  <Typography level="title-sm">Approvals</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
          </List>
        ) : user?.department === "Tender" &&
          user?.name === "Satyadeep Mohanty" ? (
          <List
            size="sm"
            sx={{
              gap: 1,
              "--List-nestedInsetStart": "30px",
              "--ListItem-radius": (theme) => theme.vars.radius.sm,
            }}
          >
            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <AssignmentRoundedIcon />
                    <ListItemContent>
                      <Typography level="title-sm">BD</Typography>
                    </ListItemContent>
                    <KeyboardArrowDownIcon
                      sx={[
                        open
                          ? {
                            transform: "rotate(180deg)",
                          }
                          : {
                            transform: "none",
                          },
                      ]}
                    />
                  </ListItemButton>
                )}
              >
                <List sx={{ gap: 0.5 }}>
                  <ListItem>
                    <ListItemButton
                      onClick={() =>
                        navigate("/sales", {
                          state: { internalPath: "/dashboard", search: "" },
                        })
                      }
                    >
                      Dashboard
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/expense_dashboard")}>
                <AccountBalanceWalletIcon />
                <ListItemContent>
                  <Typography level="title-sm">Expense Sheet</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>


            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/task_dashboard")}>
                <TaskIcon />
                <ListItemContent>
                  <Typography level="title-sm">Task</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
          </List>
        ) : user?.department === "Logistic" || user?.name === "Rajan Jha" ? (
          <List
            size="sm"
            sx={{
              gap: 1,
              "--List-nestedInsetStart": "30px",
              "--ListItem-radius": (theme) => theme.vars.radius.sm,
            }}
          >
            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/purchase-order")}>
                <EngineeringIcon />
                <ListItemContent>
                  <Typography level="title-sm">SCM</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/expense_dashboard")}>
                <AccountBalanceWalletIcon />
                <ListItemContent>
                  <Typography level="title-sm">Expense Sheet</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>


            <ListItem sx={{ mt: 0.5 }}>
              <ListItemButton onClick={() => navigate("/task_dashboard")}>
                <TaskIcon />
                <ListItemContent>
                  <Typography level="title-sm">Task</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
          </List>
        ) : null}

        <List
          size="sm"
          sx={{
            mt: "auto",
            flexGrow: 0,
            "--ListItem-radius": (theme) => theme.vars.radius.sm,
            "--List-gap": "8px",
            mb: 2,
          }}
        ></List>

        <Card
          invertedColors
          variant="soft"
          color="danger"
          orientation="horizontal"
          sx={{
            flexGrow: 0,
            py: 1,
            px: 0,
            gap: 2,
            bgcolor: "transparent",
          }}
        >
          <Avatar />
          <Stack>
            <Typography fontWeight="lg">{user?.name}</Typography>
            <Typography level="body-sm">{user?.emp_id}</Typography>
          </Stack>
          <IconButton
            onClick={handleLogout}
            size="sm"
            variant="plain"
            color="danger"
            sx={{ ml: "auto" }}
          >
            <LogoutRoundedIcon />
          </IconButton>
        </Card>
      </Box>
    </Sheet>
  );
}
export default Sidebar;
