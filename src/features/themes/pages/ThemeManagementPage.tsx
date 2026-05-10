import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  MoreVertical,
  BookMarked,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useThemePortalRoutes } from '@/features/themes/lib/themePortalRoutes'
import { useThemes, useDeleteTheme } from '@/features/themes/hooks'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { QueuePagination } from '@/features/validation/components/ValidationQueueTable'
import { AdminInsightCard } from '@/features/admin/components'

const THEME_LIST_DESCRIPTION_MAX_CHARS = 60

function formatThemeListDescription(
  raw: string | null | undefined,
  max: number,
  emptyLabel: string,
): string {
  const s = raw?.trim()
  if (!s) return emptyLabel
  if (s.length <= max) return s
  return `${s.slice(0, max).trimEnd()}...`
}

export default function ThemeManagementPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const routes = useThemePortalRoutes()
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 10
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const {
    data: pageResult,
    isLoading,
    isError,
  } = useThemes({
    search: searchQuery.trim() || undefined,
    page,
    limit: perPage,
  })
  const { mutate: deleteTheme } = useDeleteTheme()

  const rows = pageResult?.data ?? []
  const total = pageResult?.total ?? 0
  const withDescription = rows.filter((row) =>
    Boolean(row.description?.trim()),
  ).length
  const withoutDescription = rows.length - withDescription

  const confirmDelete = () => {
    if (deleteTarget) deleteTheme(deleteTarget)
    setDeleteTarget(null)
  }

  return (
    <div className='mx-auto w-full max-w-7xl space-y-4'>
      <div className='flex flex-wrap items-center gap-3'>
        <div className='flex-1'>
          <h1 className='text-2xl font-semibold tracking-tight'>
            {t('themes.list.title')}
          </h1>
          <p className='text-sm text-muted-foreground'>
            {t('themes.list.subtitle')}
          </p>
        </div>
        {total > 0 && (
          <span className='inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary tabular-nums'>
            {t('themes.list.count', { count: total })}
          </span>
        )}
      </div>

      <div className='grid gap-3 md:grid-cols-3'>
        <AdminInsightCard
          title={t('themes.admin.summaryLoaded')}
          value={rows.length}
          subtitle={t('themes.admin.summaryLoadedSubtitle')}
        />
        <AdminInsightCard
          title={t('themes.admin.summaryWithDescription')}
          value={withDescription}
          subtitle={t('themes.admin.summaryWithDescriptionSubtitle')}
        />
        <AdminInsightCard
          title={t('themes.admin.summaryNeedDetails')}
          value={withoutDescription}
          subtitle={t('themes.admin.summaryNeedDetailsSubtitle')}
        />
      </div>

      <div className='flex flex-wrap items-center gap-3'>
        <div className='relative min-w-[200px] max-w-md flex-1'>
          <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder={t('themes.list.search')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            className='pl-9'
          />
        </div>
        <Link
          to={routes.themeNew}
          className={cn(
            buttonVariants(),
            'inline-flex shrink-0 items-center gap-2 whitespace-nowrap',
          )}
        >
          <Plus className='size-4 shrink-0' />
          {t('themes.list.add')}
        </Link>
      </div>

      <Card>
        <div className='overflow-x-auto'>
          {isLoading ? (
            <div className='p-8 text-sm text-muted-foreground'>
              {t('common.loading')}
            </div>
          ) : isError ? (
            <div className='p-8 text-center text-sm text-destructive'>
              {t('themes.list.error')}
            </div>
          ) : rows.length === 0 ? (
            <div className='py-12 text-center text-sm text-muted-foreground'>
              {t('themes.list.empty')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-12' />
                  <TableHead>{t('themes.columns.name')}</TableHead>
                  <TableHead className='hidden md:table-cell'>
                    {t('themes.columns.description')}
                  </TableHead>
                  <TableHead className='w-[100px] text-right'>
                    {t('themes.columns.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow
                    key={r.id}
                    className='cursor-pointer hover:bg-muted/40'
                    onClick={() => navigate(routes.themeDetail(r.id))}
                  >
                    <TableCell>
                      <div className='flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                        <BookMarked className='size-4' strokeWidth={1.5} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className='font-medium text-foreground'>{r.name}</p>
                    </TableCell>
                    <TableCell className='hidden max-w-md md:table-cell'>
                      <p
                        className='text-sm text-muted-foreground'
                        title={
                          (r.description?.trim().length ?? 0) >
                          THEME_LIST_DESCRIPTION_MAX_CHARS
                            ? r.description?.trim()
                            : undefined
                        }
                      >
                        {formatThemeListDescription(
                          r.description,
                          THEME_LIST_DESCRIPTION_MAX_CHARS,
                          t('common.notAvailable'),
                        )}
                      </p>
                    </TableCell>
                    <TableCell
                      className='text-right'
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className={cn(
                            buttonVariants({ variant: 'ghost', size: 'icon' }),
                            'size-8',
                          )}
                        >
                          <MoreVertical className='size-4' />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem
                            onClick={() => navigate(routes.themeDetail(r.id))}
                          >
                            <Eye className='mr-2 size-4' />
                            {t('common.view')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate(routes.themeEdit(r.id))}
                          >
                            <Pencil className='mr-2 size-4' />
                            {t('common.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className='text-destructive focus:text-destructive'
                            onClick={() => setDeleteTarget(r.id)}
                          >
                            <Trash2 className='mr-2 size-4' />
                            {t('common.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        {!isLoading && !isError && total > perPage && (
          <CardContent className='border-t border-border py-3'>
            <QueuePagination
              page={page}
              total={total}
              limit={perPage}
              onPageChange={setPage}
            />
          </CardContent>
        )}
      </Card>

      <ConfirmDialog
        open={deleteTarget !== null}
        title={t('themes.deleteTitle')}
        description={t('themes.deleteDescription')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
