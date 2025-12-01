import { formatDistanceToNow } from "date-fns";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn-ui/table";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import { useFeaturedCoinsAnalytics } from "@/hooks/use-brand-analytics";
import { useFeaturedCoinsAnalyticsMetrics } from "@/hooks/use-brand-analytics-metrics";
import { AuthTokenType } from "@/lib/enums";
import { PaginationButton } from "../../pagination-button";
import { SortableTableHeader } from "../sortable-table-header";
import { StatsCard } from "../stats-card";

type SortField = "totalOpens" | "firstOpen" | "lastOpen";

// Max items per page for featured coins analytics
const MAX_ITEMS_PER_PAGE = 10;

export const FeaturedCoinsContent = () => {
  const { brand } = useAdminAuth();

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortField>("totalOpens");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const { data, isLoading, error } = useFeaturedCoinsAnalytics({
    page,
    limit: MAX_ITEMS_PER_PAGE,
    sortBy,
    sortDir,
    tokenType: AuthTokenType.ADMIN_AUTH_TOKEN,
    enabled: !!brand?.data?.id,
    brandId: brand?.data?.id,
  });

  const { data: metricsData, isLoading: isLoadingMetrics } =
    useFeaturedCoinsAnalyticsMetrics({
      tokenType: AuthTokenType.ADMIN_AUTH_TOKEN,
      brandId: brand?.data?.id,
      enabled: !!brand?.data?.id,
    });

  const handleSort = (field: SortField) => {
    if (field === sortBy) {
      // Toggle direction if clicking the same field
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      // New field, default to descending
      setSortBy(field);
      setSortDir("desc");
    }
    // Reset to first page when sorting changes
    setPage(1);
  };

  // The loading is considered initial if both metrics and table data are loading
  const isInitialLoad = isLoading && isLoadingMetrics;

  return (
    <AnimatePresence mode="wait">
      {isInitialLoad ? (
        <motion.div
          key="loading-featured-coins-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeInOut" }}
          className="flex justify-center items-center w-full h-[256px]">
          <Loader2 className="size-10 text-foreground animate-spin" />
        </motion.div>
      ) : error ? (
        <motion.div
          key="error-featured-coins-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeInOut" }}
          className="flex justify-center items-center w-full h-[256px]">
          <p className="text-lg font-bold text-destructive text-center">
            Error loading analytics data.
            <br />
            Please try again later!
          </p>
        </motion.div>
      ) : (
        <motion.div
          key="featured-coins-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex flex-col justify-start items-center w-full p-5 gap-5">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full relative">
            <AnimatePresence mode="wait">
              {isLoadingMetrics && (
                <motion.div
                  key="loading-metrics"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}
                  className="absolute inset-0 bg-background/70 flex items-center justify-center z-10 animate-pulse transition-all duration-300"
                />
              )}
            </AnimatePresence>
            <StatsCard
              title="Total Opens"
              value={metricsData?.data.totalOpens || 0}
            />
            <StatsCard
              title="Unique Openers"
              value={metricsData?.data.uniqueOpeners || 0}
            />
          </div>

          {/* Analytics Table */}
          <div className="w-full relative">
            <AnimatePresence mode="wait">
              {isLoading && !isInitialLoad && (
                <motion.div
                  key="loading-table"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}
                  className="absolute inset-0 bg-background/70 flex items-center justify-center z-10 animate-pulse transition-all duration-300"
                />
              )}
            </AnimatePresence>
            <Table className="table-fixed">
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-[25%]">User</TableHead>
                  <SortableTableHeader
                    field="totalOpens"
                    label="Total Opens"
                    currentSortField={sortBy}
                    currentSortDir={sortDir}
                    onSort={handleSort}
                  />
                  <SortableTableHeader
                    field="firstOpen"
                    label="First Open"
                    currentSortField={sortBy}
                    currentSortDir={sortDir}
                    onSort={handleSort}
                  />
                  <SortableTableHeader
                    field="lastOpen"
                    label="Last Open"
                    currentSortField={sortBy}
                    currentSortDir={sortDir}
                    onSort={handleSort}
                  />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((user) => (
                  <TableRow
                    key={user.userId}
                    className="border-border hover:bg-muted/10">
                    <TableCell className="flex items-center gap-2">
                      {user.farcasterAvatarUrl && (
                        <img
                          src={user.farcasterAvatarUrl}
                          alt=""
                          className="size-8 rounded-full"
                        />
                      )}
                      <a
                        href={`https://farcaster.xyz/${user.farcasterUsername || user.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:text-accent hover:underline">
                        {user.farcasterDisplayName ||
                          user.farcasterUsername ||
                          user.username}
                      </a>
                    </TableCell>
                    <TableCell>{user.totalOpens}</TableCell>
                    <TableCell>
                      {user.firstOpen
                        ? formatDistanceToNow(new Date(user.firstOpen + "Z"), {
                            addSuffix: true,
                            includeSeconds: true,
                          })
                        : "Unknown"}
                    </TableCell>
                    <TableCell>
                      {user.lastOpen
                        ? formatDistanceToNow(new Date(user.lastOpen + "Z"), {
                            includeSeconds: true,
                            addSuffix: true,
                          })
                        : "Unknown"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {data?.pagination?.totalPages && data.pagination.totalPages > 0 ? (
            <div className="flex justify-center items-center gap-4 pt-4">
              <PaginationButton
                disabled={page === 1}
                handleChangePage={() => setPage((p) => Math.max(1, p - 1))}
                icon={<ChevronLeft className="size-4" />}
              />

              <span className="text-sm">
                Page {data?.pagination.page} of {data?.pagination.totalPages}
              </span>

              <PaginationButton
                disabled={!data?.pagination.hasMore}
                handleChangePage={() => setPage((p) => p + 1)}
                icon={<ChevronRight className="size-4" />}
              />
            </div>
          ) : null}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
