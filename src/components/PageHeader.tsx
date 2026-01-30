import { AddRounded, MenuRounded } from "@mui/icons-material";
import { Box, Button, IconButton, Stack, Typography } from "@mui/material";

type PageHeaderProps = {
  onMenuClick: () => void;
  buildingCount?: number;
};

const PageHeader = ({
  onMenuClick,
  buildingCount = 0,
}: PageHeaderProps) => {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      alignItems={{ xs: "flex-start", sm: "center" }}
      justifyContent="space-between"
      spacing={2}
      sx={{ mb: 3 }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <IconButton
          onClick={onMenuClick}
          sx={{ display: { xs: "inline-flex", md: "none" } }}
          aria-label="Open sidebar"
        >
          <MenuRounded />
        </IconButton>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Buildings ({buildingCount})
          </Typography>
        </Box>
      </Stack>
      <Button
        variant="contained"
        startIcon={<AddRounded />}
        size="medium"
        sx={{
          borderRadius: 999,
          background: "linear-gradient(135deg, #4aace9 0%, #226bf6 100%)",
          boxShadow: "0 6px 14px rgba(34, 107, 246, 0.25)",
          textTransform: "none",
          fontWeight: 600,
          "&:hover": {
            background: "linear-gradient(135deg, #4aace9 0%, #226bf6 100%)",
          },
        }}
      >
        Create a new building
      </Button>
    </Stack>
  );
};

export default PageHeader;
