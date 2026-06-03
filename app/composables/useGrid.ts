// composables/useGrid.ts
import type { GridDataSourceRequest, GridDataSourceResult, GridSort, GridPropertyFilter } from '~/types/grid'

export function useGrid<T = any>(fetchFn: (request: GridDataSourceRequest) => Promise<GridDataSourceResult<T>>) {
  const data = ref<T[]>([])
  const totals = ref(0)
  const totalPages = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const loading = ref(false)
  const sort = ref<GridSort | null>(null)
  const filters = ref<GridPropertyFilter[]>([])

  const loadData = async () => {
    loading.value = true
    try {
      const request: GridDataSourceRequest = {
        page: currentPage.value,
        pageSize: pageSize.value,
        inputParams: {
          filters: filters.value,
          sort: sort.value
        }
      }
      const result = await fetchFn(request)
      data.value = result.data
      totals.value = result.totals
      totalPages.value = result.totalPages
      currentPage.value = result.page
      pageSize.value = result.pageSize
    } catch (error) {
      console.error('Grid data fetch failed:', error)
      data.value = []
      totals.value = 0
    } finally {
      loading.value = false
    }
  }

  const setPage = (page: number) => {
    currentPage.value = page
    loadData()
  }

  const setPageSize = (size: number) => {
    pageSize.value = size
    currentPage.value = 1
    loadData()
  }

  const setSort = (propertyName: string, ascending: boolean) => {
    sort.value = { propertyName, ascending }
    currentPage.value = 1
    loadData()
  }

  const addFilter = (filter: GridPropertyFilter) => {
    // remove existing filter with same propertyName and operation
    filters.value = filters.value.filter((f) => !(f.propertyName === filter.propertyName && f.operation === filter.operation))
    if (filter.value !== '' && filter.value !== null && filter.value !== undefined) {
      filters.value.push(filter)
    }
    currentPage.value = 1
    loadData()
  }

  const clearFilters = () => {
    filters.value = []
    currentPage.value = 1
    loadData()
  }

  // Load initial data
  onMounted(() => {
    loadData()
  })

  return {
    data,
    totals,
    totalPages,
    currentPage,
    pageSize,
    loading,
    sort,
    filters,
    loadData,
    setPage,
    setPageSize,
    setSort,
    addFilter,
    clearFilters
  }
}
