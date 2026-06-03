export function useGrid<T = any>(fetchFn: (request: GridDataSourceRequest) => Promise<GridDataSourceResult<T>>) {
  const data = ref<T[]>([]) as Ref<T[]>
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
      data.value = result.data ?? []
      totals.value = result.totals ?? 0
      totalPages.value = result.totalPages ?? 0
      currentPage.value = result.page ?? 1
      pageSize.value = result.pageSize ?? 10
    } catch (error) {
      console.error('Grid fetch error:', error)
      data.value = []
      totals.value = 0
      totalPages.value = 0
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

  const setFilters = (newFilters: GridPropertyFilter[]) => {
    filters.value = newFilters.filter((f) => f.value !== '' && f.value !== null && f.value !== undefined)
    currentPage.value = 1
    loadData()
  }

  const addFilter = (filter: GridPropertyFilter) => {
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

  onMounted(() => {
    loadData()
  })

  return {
    data: readonly(data),
    totals: readonly(totals),
    totalPages: readonly(totalPages),
    currentPage: readonly(currentPage),
    pageSize: readonly(pageSize),
    loading: readonly(loading),
    sort: readonly(sort),
    filters: readonly(filters),
    loadData,
    setPage,
    setPageSize,
    setSort,
    addFilter,
    clearFilters,
    setFilters
  }
}
