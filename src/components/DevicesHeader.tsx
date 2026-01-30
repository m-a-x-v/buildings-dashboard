import {
  AddRounded,
  ArrowBackRounded,
  FilterAltOutlined,
  KeyboardArrowDownRounded,
  LanguageRounded,
  RadarRounded,
  SortRounded,
  StarRounded,
  ViewColumnOutlined,
  SettingsOutlined,
  CloudUploadOutlined,
  ArrowForwardRounded,
  DeleteOutlineRounded,
  CloseRounded,
} from "@mui/icons-material";
import { Box, Button, Divider, IconButton, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

type DevicesHeaderProps = {
  buildingName?: string;
  onBack: () => void;
  selectionCount?: number;
  onToggleSelectionBar?: () => void;
  onCloseSelectionBar?: () => void;
  selectionBarOpen?: boolean;
};

const DevicesHeader = ({
  buildingName,
  onBack,
  selectionCount = 0,
  onToggleSelectionBar,
  onCloseSelectionBar,
  selectionBarOpen = false,
}: DevicesHeaderProps) => {
  const theme = useTheme();
  const accentBlue = theme.palette.primary.main;
  const neutralText = theme.palette.text.secondary;
  const neutralBorder = theme.palette.divider;
  const surface = theme.palette.background.paper;
  const activeBg = theme.palette.action.hover;
  const showSelectionBar = selectionBarOpen;
  const viewButtonSx = {
    borderRadius: 1,
    borderColor: neutralBorder,
    color: accentBlue,
    bgcolor: surface,
    textTransform: "none",
    fontWeight: 600,
    "& .MuiButton-startIcon": {
      color: accentBlue,
    },
    "& .MuiButton-endIcon": {
      color: accentBlue,
    },
  };
  const activeViewButtonSx = {
    ...viewButtonSx,
    color: neutralText,
    bgcolor: activeBg,
    borderColor: neutralBorder,
    "& .MuiButton-startIcon": {
      color: neutralText,
    },
    "& .MuiButton-endIcon": {
      color: neutralText,
    },
  };
  const actionButtonSx = {
    borderRadius: 1,
    borderColor: neutralBorder,
    color: neutralText,
    bgcolor: surface,
    textTransform: "none",
    fontWeight: 600,
    "& .MuiButton-startIcon": {
      color: neutralText,
    },
    "& .MuiButton-endIcon": {
      color: neutralText,
    },
  };

  return (
    <Stack spacing={2} sx={{ mb: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <IconButton onClick={onBack} aria-label="Back to buildings">
          <ArrowBackRounded />
        </IconButton>
        <Stack>
          <Typography variant="h5" fontWeight={700}>
            All devices
          </Typography>
          {buildingName ? (
            <Typography variant="body2" color="text.secondary">
              {buildingName}
            </Typography>
          ) : null}
        </Stack>
      </Stack>
      <Box
        sx={{
          pb: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            size="small"
            sx={{
              px: 0,
              minWidth: "auto",
              borderRadius: 0,
              color: "primary.main",
              borderBottom: "2px solid",
              borderColor: "primary.main",
            }}
          >
            All devices
          </Button>
        </Stack>
      </Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button
            size="small"
            variant="outlined"
            startIcon={<RadarRounded fontSize="small" />}
            sx={activeViewButtonSx}
          >
            Main view
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<LanguageRounded fontSize="small" />}
            sx={viewButtonSx}
          >
            Networking
          </Button>
          <Button size="small" variant="outlined" sx={viewButtonSx}>
            Battery health
          </Button>
          <Button size="small" variant="outlined" sx={viewButtonSx}>
            Structure
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<StarRounded fontSize="small" />}
            sx={viewButtonSx}
          >
            Custom view
          </Button>
          <IconButton
            size="small"
            sx={{
              width: 32,
              height: 32,
              border: "1px solid",
              borderColor: neutralBorder,
              borderRadius: 1,
              color: accentBlue,
              bgcolor: surface,
            }}
          >
            <AddRounded fontSize="small" />
          </IconButton>
        </Stack>
        <Box sx={{ position: "relative", display: "inline-flex" }}>
          {showSelectionBar ? (
            <Box
              sx={{
                position: "absolute",
                left: -220,
                right: 0,
                maxWidth: "calc(100vw - 32px)",
                top: 0,
                transform: "translateY(-120%)",
                px: 2.5,
                py: 1,
                borderRadius: 2,
                border: "1px solid",
                borderColor: neutralBorder,
                bgcolor: surface,
                boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
                display: "flex",
                alignItems: "center",
                gap: 3,
                zIndex: 2,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    minWidth: 22,
                    height: 22,
                    px: 0.75,
                    borderRadius: 1,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {selectionCount}
                </Box>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="primary.main"
                >
                  devices selected
                </Typography>
              </Stack>
              <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
              <Stack direction="row" spacing={2} alignItems="center">
                <Stack alignItems="center" spacing={0.25}>
                  <SettingsOutlined fontSize="small" />
                  <Typography variant="caption" color={neutralText}>
                    Manage
                  </Typography>
                </Stack>
                <Stack alignItems="center" spacing={0.25}>
                  <CloudUploadOutlined fontSize="small" />
                  <Typography variant="caption" color={neutralText}>
                    FUOTA
                  </Typography>
                </Stack>
                <Stack alignItems="center" spacing={0.25}>
                  <ArrowForwardRounded fontSize="small" />
                  <Typography variant="caption" color={neutralText}>
                    Move
                  </Typography>
                </Stack>
                <Stack alignItems="center" spacing={0.25}>
                  <DeleteOutlineRounded fontSize="small" />
                  <Typography variant="caption" color={neutralText}>
                    Delete
                  </Typography>
                </Stack>
              </Stack>
              <IconButton
                size="small"
                aria-label="Close selection bar"
                onClick={onCloseSelectionBar}
                sx={{ ml: "auto" }}
              >
                <CloseRounded fontSize="small" />
              </IconButton>
            </Box>
          ) : null}
          <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button
            size="small"
            variant="outlined"
            startIcon={<SortRounded fontSize="small" />}
            sx={actionButtonSx}
          >
            Sort
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ViewColumnOutlined fontSize="small" />}
            sx={actionButtonSx}
          >
            Fields
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<FilterAltOutlined fontSize="small" />}
            endIcon={<KeyboardArrowDownRounded fontSize="small" />}
            sx={{
              ...actionButtonSx,
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              whiteSpace: "nowrap",
            }}
            onClick={onToggleSelectionBar}
            aria-pressed={selectionBarOpen}
          >
            Filter
            <Box
              sx={{
                ml: 0.75,
                width: 18,
                height: 18,
                borderRadius: 1,
                bgcolor: accentBlue,
                color: "#ffffff",
                fontSize: "0.65rem",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {selectionCount}
            </Box>
          </Button>
          </Stack>
        </Box>
      </Stack>
    </Stack>
  );
};

export default DevicesHeader;
