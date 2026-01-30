import { LocationOnOutlined, MoreHorizRounded } from "@mui/icons-material";
import {
  Box,
  Divider,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";

const placeholderItems = Array.from({ length: 6 });

const BuildingsListSkeleton = () => {
  return (
    <Stack spacing={1.5}>
      {placeholderItems.map((_, index) => (
        <Paper
          key={`placeholder-${index}`}
          sx={{
            p: { xs: 1.5, md: 1.75 },
            borderRadius: "6px",
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.05)",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems="center"
          >
            <Skeleton
              variant="rounded"
              width={120}
              height={120}
              sx={{ borderRadius: "4px" }}
            />
            <Box sx={{ flex: 1, width: "100%" }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="40%" height={22} />
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LocationOnOutlined fontSize="small" color="disabled" />
                    <Skeleton width="45%" height={18} />
                  </Stack>
                </Box>
                <IconButton size="small" sx={{ opacity: 0.6 }}>
                  <MoreHorizRounded fontSize="small" />
                </IconButton>
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
                <Skeleton width={90} height={18} />
                <Skeleton width={110} height={18} />
                <Skeleton width={100} height={18} />
                <Skeleton width={120} height={18} />
                <Skeleton width={140} height={18} />
              </Stack>
            </Box>
          </Stack>
        </Paper>
      ))}

      <Typography
        variant="body2"
        color="text.secondary"
        textAlign="center"
        sx={{ py: 1 }}
      >
        Loading buildings...
      </Typography>
    </Stack>
  );
};

export default BuildingsListSkeleton;
