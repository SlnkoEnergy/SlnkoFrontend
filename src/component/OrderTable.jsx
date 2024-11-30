import * as React from 'react';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Link from '@mui/joy/Link';
import Input from '@mui/joy/Input';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Table from '@mui/joy/Table';
import Sheet from '@mui/joy/Sheet';
import Checkbox from '@mui/joy/Checkbox';
import IconButton, { iconButtonClasses } from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import Dropdown from '@mui/joy/Dropdown';

import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import BlockIcon from '@mui/icons-material/Block';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';

const rows = [
  {
    id: 'INV-1234',
    date: 'Feb 3, 2023',
    status: 'Refunded',
    customer: {
      initial: 'O',
      name: 'Olivia Ryhe',
      email: 'olivia@email.com',
    },
  },
  {
    id: 'INV-1233',
    date: 'Feb 3, 2023',
    status: 'Paid',
    customer: {
      initial: 'S',
      name: 'Steve Hampton',
      email: 'steve.hamp@email.com',
    },
  },
  {
    id: 'INV-1232',
    date: 'Feb 3, 2023',
    status: 'Refunded',
    customer: {
      initial: 'C',
      name: 'Ciaran Murray',
      email: 'ciaran.murray@email.com',
    },
  },
  {
    id: 'INV-1231',
    date: 'Feb 3, 2023',
    status: 'Refunded',
    customer: {
      initial: 'M',
      name: 'Maria Macdonald',
      email: 'maria.mc@email.com',
    },
  },
  {
    id: 'INV-1230',
    date: 'Feb 3, 2023',
    status: 'Cancelled',
    customer: {
      initial: 'C',
      name: 'Charles Fulton',
      email: 'fulton@email.com',
    },
  },
  {
    id: 'INV-1229',
    date: 'Feb 3, 2023',
    status: 'Cancelled',
    customer: {
      initial: 'J',
      name: 'Jay Hooper',
      email: 'hooper@email.com',
    },
  },
  {
    id: 'INV-1228',
    date: 'Feb 3, 2023',
    status: 'Refunded',
    customer: {
      initial: 'K',
      name: 'Krystal Stevens',
      email: 'k.stevens@email.com',
    },
  },
  {
    id: 'INV-1227',
    date: 'Feb 3, 2023',
    status: 'Paid',
    customer: {
      initial: 'S',
      name: 'Sachin Flynn',
      email: 's.flyn@email.com',
    },
  },
  {
    id: 'INV-1226',
    date: 'Feb 3, 2023',
    status: 'Cancelled',
    customer: {
      initial: 'B',
      name: 'Bradley Rosales',
      email: 'brad123@email.com',
    },
  },
  {
    id: 'INV-1225',
    date: 'Feb 3, 2023',
    status: 'Paid',
    customer: {
      initial: 'O',
      name: 'Olivia Ryhe',
      email: 'olivia@email.com',
    },
  },
  {
    id: 'INV-1224',
    date: 'Feb 3, 2023',
    status: 'Cancelled',
    customer: {
      initial: 'S',
      name: 'Steve Hampton',
      email: 'steve.hamp@email.com',
    },
  },
  {
    id: 'INV-1223',
    date: 'Feb 3, 2023',
    status: 'Paid',
    customer: {
      initial: 'C',
      name: 'Ciaran Murray',
      email: 'ciaran.murray@email.com',
    },
  },
  {
    id: 'INV-1221',
    date: 'Feb 3, 2023',
    status: 'Refunded',
    customer: {
      initial: 'M',
      name: 'Maria Macdonald',
      email: 'maria.mc@email.com',
    },
  },
  {
    id: 'INV-1220',
    date: 'Feb 3, 2023',
    status: 'Paid',
    customer: {
      initial: 'C',
      name: 'Charles Fulton',
      email: 'fulton@email.com',
    },
  },
  {
    id: 'INV-1219',
    date: 'Feb 3, 2023',
    status: 'Cancelled',
    customer: {
      initial: 'J',
      name: 'Jay Hooper',
      email: 'hooper@email.com',
    },
  },
  {
    id: 'INV-1218',
    date: 'Feb 3, 2023',
    status: 'Cancelled',
    customer: {
      initial: 'K',
      name: 'Krystal Stevens',
      email: 'k.stevens@email.com',
    },
  },
  {
    id: 'INV-1217',
    date: 'Feb 3, 2023',
    status: 'Paid',
    customer: {
      initial: 'S',
      name: 'Sachin Flynn',
      email: 's.flyn@email.com',
    },
  },
  {
    id: 'INV-1216',
    date: 'Feb 3, 2023',
    status: 'Cancelled',
    customer: {
      initial: 'B',
      name: 'Bradley Rosales',
      email: 'brad123@email.com',
    },
  },
];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function RowMenu() {
  return (
    <Dropdown>
      <MenuButton
        slots={{ root: IconButton }}
        slotProps={{ root: { variant: 'plain', color: 'neutral', size: 'sm' } }}
      >
        <MoreHorizRoundedIcon />
      </MenuButton>
      <Menu size="sm" sx={{ minWidth: 140 }}>
        <MenuItem>Edit</MenuItem>
        <MenuItem>Rename</MenuItem>
        <MenuItem>Move</MenuItem>
        <Divider />
        <MenuItem color="danger">Delete</MenuItem>
      </Menu>
    </Dropdown>
  );
}

function OrderTable() {
  const [order, setOrder] = React.useState('desc');
  const [selected, setSelected] = React.useState([]);
  const [open, setOpen] = React.useState(false);

  const renderFilters = () => (
    <>
      <FormControl size="sm">
        <FormLabel>Group Name</FormLabel>
        <Select
          size="sm"
          placeholder="Filter by status"
          slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
        >
          <Option value="paid">Paid</Option>
          <Option value="pending">Pending</Option>
          <Option value="refunded">Refunded</Option>
          <Option value="cancelled">Cancelled</Option>
        </Select>
      </FormControl>
      {/* <FormControl size="sm">
        <FormLabel>Category</FormLabel>
        <Select size="sm" placeholder="All">
          <Option value="all">All</Option>
          <Option value="refund">Refund</Option>
          <Option value="purchase">Purchase</Option>
          <Option value="debit">Debit</Option>
        </Select>
      </FormControl> */}
      {/* <FormControl size="sm">
        <FormLabel>Customer</FormLabel>
        <Select size="sm" placeholder="All">
          <Option value="all">All</Option>
          <Option value="olivia">Olivia Rhye</Option>
          <Option value="steve">Steve Hampton</Option>
          <Option value="ciaran">Ciaran Murray</Option>
          <Option value="marina">Marina Macdonald</Option>
          <Option value="charles">Charles Fulton</Option>
          <Option value="jay">Jay Hoper</Option>
        </Select>
      </FormControl> */}
     
    </>
  );

  return (
    <>
      {/* Mobile Filters */}
      <Sheet
        className="SearchAndFilters-mobile"
        sx={{ display: { xs: 'flex', sm: 'none' }, my: 1, gap: 1 }}
      >
        <Input
          size="sm"
          placeholder="Search"
          startDecorator={<SearchIcon />}
          sx={{ flexGrow: 1 }}
        />
        <IconButton
          size="sm"
          variant="outlined"
          color="neutral"
          onClick={() => setOpen(true)}
        >
          <FilterAltIcon />
        </IconButton>
        <Modal open={open} onClose={() => setOpen(false)}>
          <ModalDialog aria-labelledby="filter-modal" layout="fullscreen">
            <ModalClose />
            <Typography id="filter-modal" level="h2">
              Filters
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Sheet sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {renderFilters()}
              <Button color="primary" onClick={() => setOpen(false)}>
                Submit
              </Button>
            </Sheet>
          </ModalDialog>
        </Modal>
      </Sheet>

      {/* Tablet and Up Filters */}
      <Box
        className="SearchAndFilters-tabletUp"
        sx={{
          borderRadius: 'sm',
          py: 2,
          display: { xs: 'none', sm: 'flex' },
          flexWrap: 'wrap',
          gap: 1.5,
          '& > *': {
            minWidth: { xs: '120px', md: '160px' },
          },
        }}
      >
        <FormControl sx={{ flex: 1 }} size="sm">
          <FormLabel>Search here</FormLabel>
          <Input size="sm" placeholder="Search" startDecorator={<SearchIcon />} />
        </FormControl>
        {renderFilters()}
      </Box>

      {/* Table */}
      <Sheet
        className="OrderTableContainer"
        variant="outlined"
        sx={{
          display: { xs: 'none', sm: 'initial' },
          width: '100%',
          borderRadius: 'sm',
          flexShrink: 1,
          overflow: 'auto',
          minHeight: 0,
        }}
      >
        {/* Table Implementation */}
        <Table stickyHeader hoverRow>
         
        </Table>
      </Sheet>

      {/* Pagination */}
      <Box
        className="Pagination-laptopUp"
        sx={{
          pt: 2,
          gap: 1,
          [`& .${iconButtonClasses.root}`]: { borderRadius: '50%' },
          display: { xs: 'none', md: 'flex' },
        }}
      >
        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          startDecorator={<KeyboardArrowLeftIcon />}
        >
          Previous
        </Button>
        <Box sx={{ flex: 1 }} />
        {['1', '2', '3', '…', '8', '9', '10'].map((page) => (
          <IconButton
            key={page}
            size="sm"
            variant={Number(page) ? 'outlined' : 'plain'}
            color="neutral"
          >
            {page}
          </IconButton>
        ))}
        <Box sx={{ flex: 1 }} />
        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          endDecorator={<KeyboardArrowRightIcon />}
        >
          Next
        </Button>
      </Box>
    </>
  );
}
export default OrderTable;