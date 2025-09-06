import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TaskIcon from "@mui/icons-material/Task";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
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
import Main_Logo from "../../assets/protrac_logo.png";
import { closeSidebar } from "../../utils/utils";
import DatabaseIcon from "@mui/icons-material/Storage";

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
  const location = useLocation();
  useEffect(() => {
    const userData = getUserData();
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
  const isEngineering = location.pathname === "/overview";
  return (
    <Sheet
      className="Sidebar"
      sx={{
        position: "fixed",
        transition: "transform 0.4s, width 0.4s",
        zIndex: 10000,
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
          lg: isSalesPage
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
          zIndex: 9999,
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
            lg: isSalesPage
              ? "translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1) + var(--SideNavigation-slideIn, 0) * var(--Sidebar-width, 0px)))"
              : "translateX(-100%)",
          },
        }}
        onClick={() => closeSidebar()}
      />
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <IconButton variant="soft" color="primary" size="sm">
          <img
            src={Main_Logo}
            alt="Protrac"
            style={{ width: "70px", height: "60px" }}
          />
        </IconButton>
        {/* <ColorSchemeToggle sx={{ ml: "auto" }} /> */}
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
                    Dashboard
                  </Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <AccountCircleIcon />
                    <ListItemContent>
                      <Typography level="title-sm"> User</Typography>
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
                    <ListItemButton onClick={() => navigate("/add_user")}>
                      Add User
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton onClick={() => navigate("/edit_user")}>
                      Edit User
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
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

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <SettingsSuggestIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Internal Ops</Typography>
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
                    <ListItemButton onClick={() => navigate("/handover_dash")}>
                      HandOver Approval
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <MiscellaneousServicesIcon />
                    <ListItemContent>
                      <Typography level="title-sm">CAM</Typography>
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
                    <ListItemButton onClick={() => navigate("/cam_dash")}>
                      Dashboard
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton
                      onClick={() => navigate("/purchase_request")}
                    >
                      Purchase Request
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <BuildIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Eng</Typography>
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
                    <ListItemButton onClick={() => navigate("/eng_dash")}>
                      Dashboard
                    </ListItemButton>
                  </ListItem>
                  <ListItem sx={{ mt: 0.5 }}>
                    <ListItemButton onClick={() => navigate("/inspection")}>
                      Inspection
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
                    <ListItemButton onClick={() => navigate("/logistics")}>
                      Logistics
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

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <SolarPowerIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Projects</Typography>
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
                    <ListItemButton onClick={() => navigate("/all-project")}>
                      All Projects
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton onClick={() => navigate("#")}>
                      Site Projects
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <AccountBalanceWalletIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Expense Sheet</Typography>
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
                      onClick={() => navigate("/expense_dashboard")}
                    >
                      Expense Dashboard
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton
                      onClick={() => navigate("/expense_approval")}
                    >
                      Expense Approval
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton onClick={() => navigate("/expense_hr")}>
                      HR Expense Approval
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton
                      onClick={() => navigate("/expense_accounts")}
                    >
                      Accounts Expense Approval
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <TaskIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Task</Typography>
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
                    <ListItemButton onClick={() => navigate("/all_task")}>
                      Task View
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
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
                    <ListItemButton onClick={() => navigate("/categories")}>
                      Categories
                    </ListItemButton>
                  </ListItem>

                  <ListItem sx={{ mt: 0.5 }}>
                    <ListItemButton onClick={() => navigate("/products")}>
                      Products
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
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

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <AccountBalanceWalletIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Expense Sheet</Typography>
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
                      onClick={() => navigate("/expense_dashboard")}
                    >
                      User Dashboard
                    </ListItemButton>
                  </ListItem>

                  <ListItem sx={{ mt: 0.5 }}>
                    <ListItemButton
                      onClick={() => navigate("/expense_accounts")}
                    >
                      Accounts Expense Approval
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <TaskIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Task</Typography>
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
                    <ListItemButton onClick={() => navigate("/all_task")}>
                      Task View
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
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

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <AccountBalanceWalletIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Expense Sheet</Typography>
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
                      onClick={() => navigate("/expense_dashboard")}
                    >
                      User Dashboard
                    </ListItemButton>
                  </ListItem>
                  {user?.department === "BD" && user?.emp_id === "SE-277" && (
                    <ListItem>
                      <ListItemButton
                        onClick={() => navigate("/expense_approval")}
                      >
                        Expense Approval
                      </ListItemButton>
                    </ListItem>
                  )}
                </List>
              </Toggler>
            </ListItem>

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <TaskIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Task</Typography>
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
                    <ListItemButton onClick={() => navigate("/all_task")}>
                      Task View
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
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

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <TaskIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Task</Typography>
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
                    <ListItemButton onClick={() => navigate("/all_task")}>
                      Task View
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>
            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <AccountBalanceWalletIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Expense Sheet</Typography>
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
                  {/* <ListItem sx={{ mt: 0.5 }}>
                    <ListItemButton
                      onClick={() => navigate("/expense_dashboard")}
                    >
                      User Dashboard
                    </ListItemButton>
                  </ListItem> */}
                  <ListItem>
                    <ListItemButton
                      onClick={() => navigate("/expense_approval")}
                    >
                      Expense Manager Approval
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton
                      onClick={() => navigate("/expense_accounts")}
                    >
                      Accounts Expense Approval
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>
          </List>
        ) : user?.name === "Guddu Rani Dubey" ||
          (user?.name === "Prachi Singh" && user?.department === "Internal") ? (
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
            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <MiscellaneousServicesIcon />
                    <ListItemContent>
                      <Typography level="title-sm">CAM</Typography>
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
                    <ListItemButton onClick={() => navigate("/cam_dash")}>
                      Dashboard
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton
                      onClick={() => navigate("/purchase_request")}
                    >
                      Purchase Request
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            {/* SCM Section */}
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
                    <ListItemButton onClick={() => navigate("/logistics")}>
                      Logistics
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

            {/* Projects Section */}
            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <SolarPowerIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Projects</Typography>
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
                    <ListItemButton onClick={() => navigate("/all-project")}>
                      All Projects
                    </ListItemButton>
                  </ListItem>
                  {/* <ListItem>
                <ListItemButton onClick={() => navigate("#")}>
                  Site Projects
                </ListItemButton>
              </ListItem> */}
                </List>
              </Toggler>
            </ListItem>

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <TaskIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Task</Typography>
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
                    <ListItemButton onClick={() => navigate("/all_task")}>
                      Task View
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
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
              <ListItem nested>
                <Toggler
                  renderToggle={({ open, setOpen }) => (
                    <ListItemButton onClick={() => setOpen(!open)}>
                      <SettingsSuggestIcon />
                      <ListItemContent>
                        <Typography level="title-sm">Internal Ops</Typography>
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
                        onClick={() => navigate("/handover_dash")}
                      >
                        HandOver Approval
                      </ListItemButton>
                    </ListItem>
                  </List>
                </Toggler>
              </ListItem>
            )}

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <AccountBalanceWalletIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Expense Sheet</Typography>
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
                      onClick={() => navigate("/expense_dashboard")}
                    >
                      User Dashboard
                    </ListItemButton>
                  </ListItem>

                  {user?.name === "Prachi Singh" && (
                    <ListItem>
                      <ListItemButton
                        onClick={() => navigate("/expense_approval")}
                      >
                        Expense Manager Approval
                      </ListItemButton>
                    </ListItem>
                  )}
                </List>
              </Toggler>
            </ListItem>
          </List>
        ) : user?.role === "purchase" &&
          (user?.name === "Aryan Maheshwari" ||
            user?.name === "Sarthak Sharma" ||
            user?.name === "Ajay Singh" ||
            user?.name === "Shubham Gupta" ||
            user?.name === "Saurabh Suman" ||
            user?.name === "Rahul Pareek" ||
            user?.name === "Sujoy Mahata") ? (
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

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <MiscellaneousServicesIcon />
                    <ListItemContent>
                      <Typography level="title-sm">CAM</Typography>
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
                      onClick={() => navigate("/purchase_request")}
                    >
                      Purchase Request
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            {/* SCM Section */}
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
                    <ListItemButton onClick={() => navigate("/logistics")}>
                      Logistics
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

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <AccountBalanceWalletIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Expense Sheet</Typography>
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
                      onClick={() => navigate("/expense_dashboard")}
                    >
                      User Dashboard
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <TaskIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Task</Typography>
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
                    <ListItemButton onClick={() => navigate("/all_task")}>
                      Task View
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
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

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <MiscellaneousServicesIcon />
                    <ListItemContent>
                      <Typography level="title-sm">CAM</Typography>
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
                      onClick={() => navigate("/purchase_request")}
                    >
                      Purchase Request
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
                    <ListItemButton onClick={() => navigate("/logistics")}>
                      Logistics
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
                    <AccountBalanceWalletIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Expense Sheet</Typography>
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
                      onClick={() => navigate("/expense_dashboard")}
                    >
                      User Dashboard
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton
                      onClick={() => navigate("/expense_approval")}
                    >
                      Expense Manager Approval
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <TaskIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Task</Typography>
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
                    <ListItemButton onClick={() => navigate("/all_task")}>
                      Task View
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
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
                  {/* <ListItem>
                <ListItemButton onClick={() => navigate("#")}>
                  Material Status
                </ListItemButton>
              </ListItem>
              <ListItem>
                <ListItemButton onClick={() => navigate("#")}>
                  Vendor Bill
                </ListItemButton>
              </ListItem> */}
                </List>
              </Toggler>
            </ListItem>

            {/* CAM Section */}

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <MiscellaneousServicesIcon />
                    <ListItemContent>
                      <Typography level="title-sm">CAM</Typography>
                    </ListItemContent>
                    <KeyboardArrowDownIcon
                      sx={{
                        transform: open ? "rotate(180deg)" : "none",
                      }}
                    />
                  </ListItemButton>
                )}
              >
                <List>
                  <ListItem sx={{ mt: 0.5 }}>
                    <ListItemButton onClick={() => navigate("/cam_dash")}>
                      Dashboard
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton
                      onClick={() => navigate("/purchase_request")}
                    >
                      Purchase Request
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <AccountBalanceWalletIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Expense Sheet</Typography>
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
                  {/* <ListItem sx={{ mt: 0.5 }}>
                    <ListItemButton
                      onClick={() => navigate("/expense_dashboard")}
                    >
                      User Dashboard
                    </ListItemButton>
                  </ListItem> */}
                  <ListItem>
                    <ListItemButton
                      onClick={() => navigate("/expense_approval")}
                    >
                      Expense Manager Approval
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <TaskIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Task</Typography>
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
                    <ListItemButton onClick={() => navigate("/all_task")}>
                      Task View
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
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
          </List>
        ) : user?.department === "CAM" &&
          (user?.name === "Som Narayan Jha" ||
            user?.name === "Ashish Kumar" ||
            user?.name === "Tanvi Jha" ||
            user?.name === "Saresh" ||
            user?.name === "Deepika Singh" ||
            user?.name === "Izhan Mustafa") ? (
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
                  {/* <ListItem>
                <ListItemButton onClick={() => navigate("#")}>
                  Material Status
                </ListItemButton>
              </ListItem>
              <ListItem>
                <ListItemButton onClick={() => navigate("#")}>
                  Vendor Bill
                </ListItemButton>
              </ListItem> */}
                </List>
              </Toggler>
            </ListItem>

            {/* CAM Section */}
            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <MiscellaneousServicesIcon />
                    <ListItemContent>
                      <Typography level="title-sm">CAM</Typography>
                    </ListItemContent>
                    <KeyboardArrowDownIcon
                      sx={{
                        transform: open ? "rotate(180deg)" : "none",
                      }}
                    />
                  </ListItemButton>
                )}
              >
                <List>
                  <ListItem sx={{ mt: 0.5 }}>
                    <ListItemButton onClick={() => navigate("/cam_dash")}>
                      Dashboard
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton
                      onClick={() => navigate("/purchase_request")}
                    >
                      Purchase Request
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <AccountBalanceWalletIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Expense Sheet</Typography>
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
                      onClick={() => navigate("/expense_dashboard")}
                    >
                      User Dashboard
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <TaskIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Task</Typography>
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
                    <ListItemButton onClick={() => navigate("/all_task")}>
                      Task View
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
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
            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <BuildIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Eng</Typography>
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
                    <ListItemButton onClick={() => navigate("/eng_dash")}>
                      Dashboard
                    </ListItemButton>
                  </ListItem>
                  <ListItem sx={{ mt: 0.5 }}>
                    <ListItemButton onClick={() => navigate("/inspection")}>
                      Inspection
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <AccountBalanceWalletIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Expense Sheet</Typography>
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
                      onClick={() => navigate("/expense_dashboard")}
                    >
                      User Dashboard
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton
                      onClick={() => navigate("/expense_approval")}
                    >
                      Expense Manager Approval
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <TaskIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Task</Typography>
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
                    <ListItemButton onClick={() => navigate("/all_task")}>
                      Task View
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
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
            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <AccountBalanceWalletIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Expense Sheet</Typography>
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
                      onClick={() => navigate("/expense_dashboard")}
                    >
                      User Dashboard
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton
                      onClick={() => navigate("/expense_approval")}
                    >
                      Expense Manager Approval
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton onClick={() => navigate("/expense_hr")}>
                      HR Expense Approval
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <TaskIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Task</Typography>
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
                    <ListItemButton onClick={() => navigate("/all_task")}>
                      Task View
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
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
            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <AccountBalanceWalletIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Expense Sheet</Typography>
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
                      onClick={() => navigate("/expense_dashboard")}
                    >
                      User Dashboard
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>
          </List>
        ) : user?.department === "Projects" ||
          user?.department === "Infra" ||
          user?.department === "Marketing" ||
          user?.department === "Internal" ||
          user?.department === "Loan" ||
          (user?.department === "Engineering" &&
            user?.name !== "Rishav Mahato" &&
            user?.name !== "Piyush Rathour Raj" &&
            user?.name !== "Naresh Kumar" &&
            user?.name !== "Md Asif" &&
            user?.name !== "Rahul Bhati" &&
            user?.name !== "Sachin Jangid" &&
            user?.name !== "Vishal Kushwaha" &&
            user?.name !== "Hitesh Jangid" &&
            user?.emp_id !== "SE-184" &&
            user?.emp_id !== "SE-193") ||
          user?.name === "Manish Shah" ||
          (user?.department === "CAM" && user?.name !== "Shantanu Sameer") ? (
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
                    <AccountBalanceWalletIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Expense Sheet</Typography>
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
                      onClick={() => navigate("/expense_dashboard")}
                    >
                      User Dashboard
                    </ListItemButton>
                  </ListItem>
                  {((user?.department === "Projects" &&
                    user?.name === "Mayank Kumar") ||
                    user?.name === "Vivek Pandey" ||
                    user?.name === "Disha Sharma") && (
                    <ListItem>
                      <ListItemButton
                        onClick={() => navigate("/expense_approval")}
                      >
                        Expense Approval
                      </ListItemButton>
                    </ListItem>
                  )}
                </List>
              </Toggler>
            </ListItem>

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <TaskIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Task</Typography>
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
                    <ListItemButton onClick={() => navigate("/all_task")}>
                      Task View
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
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
          </List>
        ) : user?.department === "Engineering" &&
          (user?.name === "Rishav Mahato" ||
            user?.name !== "Piyush Rathour Raj" ||
            user?.name !== "Naresh Kumar" ||
            user?.name !== "Md Asif" ||
            user?.name !== "Rahul Bhati" ||
            user?.name !== "Sachin Jangid" ||
            user?.name !== "Vishal Kushwaha" ||
            user?.name !== "Hitesh Jangid" ||
            user?.emp_id !== "SE-184" ||
            user?.emp_id !== "SE-193") ? (
          <List>
            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <BuildIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Eng</Typography>
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
                    <ListItemButton onClick={() => navigate("/eng_dash")}>
                      Dashboard
                    </ListItemButton>
                  </ListItem>
                  <ListItem sx={{ mt: 0.5 }}>
                    <ListItemButton onClick={() => navigate("/inspection")}>
                      Inspection
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <AccountBalanceWalletIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Expense Sheet</Typography>
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
                      onClick={() => navigate("/expense_dashboard")}
                    >
                      User Dashboard
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <TaskIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Task</Typography>
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
                    <ListItemButton onClick={() => navigate("/all_task")}>
                      Task View
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
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
                  {/* <ListItem>
                <ListItemButton onClick={() => navigate("#")}>
                  Material Status
                </ListItemButton>
              </ListItem>
              <ListItem>
                <ListItemButton onClick={() => navigate("#")}>
                  Vendor Bill
                </ListItemButton>
              </ListItem> */}
                </List>
              </Toggler>
            </ListItem>

            {/* CAM Section */}
            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <MiscellaneousServicesIcon />
                    <ListItemContent>
                      <Typography level="title-sm">CAM</Typography>
                    </ListItemContent>
                    <KeyboardArrowDownIcon
                      sx={{
                        transform: open ? "rotate(180deg)" : "none",
                      }}
                    />
                  </ListItemButton>
                )}
              >
                <List>
                  <ListItem sx={{ mt: 0.5 }}>
                    <ListItemButton onClick={() => navigate("/cam_dash")}>
                      Dashboard
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton
                      onClick={() => navigate("/purchase_request")}
                    >
                      Purchase Request
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <AccountBalanceWalletIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Expense Sheet</Typography>
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
                      onClick={() => navigate("/expense_dashboard")}
                    >
                      User Dashboard
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <TaskIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Task</Typography>
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
                    <ListItemButton onClick={() => navigate("/all_task")}>
                      Task View
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
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

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <AccountBalanceWalletIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Expense Sheet</Typography>
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
                      onClick={() => navigate("/expense_dashboard")}
                    >
                      User Dashboard
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <TaskIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Task</Typography>
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
                    <ListItemButton onClick={() => navigate("/all_task")}>
                      Task View
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>
          </List>
        ) : user?.department === "Logistic" &&
          user?.name === "Rajan Kumar Jha" ? (
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
                    <ListItemButton onClick={() => navigate("/logistics")}>
                      Logistics
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

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <AccountBalanceWalletIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Expense Sheet</Typography>
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
                      onClick={() => navigate("/expense_dashboard")}
                    >
                      User Dashboard
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>

            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <TaskIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Task</Typography>
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
                    <ListItemButton onClick={() => navigate("/all_task")}>
                      Task View
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
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
