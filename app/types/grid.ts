// app/types/grid.ts

export interface GridSort {
  propertyName: string
  ascending: boolean
}

export interface GridPropertyFilter {
  propertyName: string
  operation: string // equals, contains, greaterthan, etc.
  value: string
}

export interface GridParamsInput {
  filters: GridPropertyFilter[]
  sort: GridSort | null
}

export interface GridDataSourceRequest {
  page: number
  pageSize: number
  inputParams: GridParamsInput
}

export interface GridDataSourceResult<T> {
  page: number
  pageSize: number
  totalPages: number
  totals: number
  data: T[]
}

// اضافه شده - مشخصات فیلدهای مجاز برای گرید
export interface GridAllowedPropertyFilterDto {
  propertyName: string
  operation: string
}

export interface GridDataSourceRequestAllowedParameters {
  allowedFilterProperties: GridAllowedPropertyFilterDto[]
  allowedSortProperties: string[]
}

// Helper to build request object
export function createGridRequest(page = 1, pageSize = 10, sort?: GridSort, filters: GridPropertyFilter[] = []): GridDataSourceRequest {
  return {
    page,
    pageSize,
    inputParams: {
      filters,
      sort: sort || null
    }
  }
}

// Operation constants (match backend)
export const GridFilterOperation = {
  Equals: 'equals',
  GreaterThan: 'greaterthan',
  GreaterThanOrEqual: 'greaterthanorequal',
  LessThan: 'lessthan',
  LessThanOrEqual: 'lessthanorequal',
  Contains: 'contains',
  StartsWith: 'startswith',
  EndsWith: 'endswith',
  BooleanEquals: 'booleanquals'
} as const

export type GridFilterOperationType = (typeof GridFilterOperation)[keyof typeof GridFilterOperation]
