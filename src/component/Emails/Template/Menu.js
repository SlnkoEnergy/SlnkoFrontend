import React, { useState, useRef, useCallback, Fragment } from "react";
import JoyMenu, { MenuActions } from "@mui/joy/Menu";
import MenuItem from "@mui/joy/MenuItem";
import { ListActionTypes } from "@mui/base/useList";

export default function Menu({ control, menus, id }) {
  const [buttonElement, setButtonElement] = useState(null);
  const [isOpen, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const menuActions = useRef(null);
  const preventReopen = useRef(false);

  const updateAnchor = useCallback((node) => {
    setButtonElement(node);
  }, []);

  const handleButtonClick = (event) => {
    if (preventReopen.current) {
      event.preventDefault();
      preventReopen.current = false;
      return;
    }
    setOpen((open) => !open);
  };

  const handleButtonKeyDown = (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      if (event.key === "ArrowUp") {
        menuActions.current?.dispatch({
          type: ListActionTypes.keyDown,
          key: event.key,
          event,
        });
      }
    }
  };

  const close = () => {
    setOpen(false);
    if (buttonRef.current) buttonRef.current.focus();
  };

  return (
    <Fragment>
      {React.cloneElement(control, {
        type: "button",
        onClick: handleButtonClick,
        onKeyDown: handleButtonKeyDown,
        ref: updateAnchor,
        "aria-controls": isOpen ? id : undefined,
        "aria-expanded": isOpen || undefined,
        "aria-haspopup": "menu",
      })}

      <JoyMenu
        id={id}
        placement="bottom-end"
        actions={menuActions}
        open={isOpen}
        onClose={close}
        anchorEl={buttonElement}
        sx={{ minWidth: 120 }}
      >
        {menus.map(({ label, active, ...item }) => {
          const menuItem = (
            <MenuItem
              key={label}
              selected={active}
              variant={active ? "soft" : "plain"}
              onClick={close}
              {...item}
            >
              {label}
            </MenuItem>
          );

          if (item.href) {
            return (
              <li key={label} role="none">
                {React.cloneElement(menuItem, { component: "a" })}
              </li>
            );
          }

          return menuItem;
        })}
      </JoyMenu>
    </Fragment>
  );
}
