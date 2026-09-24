import React, { useMemo } from 'react'
import { useFieldStore, FieldCard } from '@/entities/field'
import { usePointStore, PointCard } from '@/entities/point'
import { PointsFilterBar } from '@/features/filter-points'
import { ExportPointsButton } from '@/features/export-points'
import { ResetDataButton } from '@/features/reset-demo-data'
import { useNavigationStore } from '@/shared/model'
import { POINT_TYPE_CONFIGS } from '@/shared/config/pointTypes'
import { Layers, MapPin, Sprout } from 'lucide-react'

interface ManagementSidebarProps {
  onSelectPoint?: () => void
  onSelectField?: () => void
}

export const ManagementSidebar: React.FC<ManagementSidebarProps> = ({ onSelectPoint, onSelectField }) => {
  const setActiveTab = useNavigationStore((s) => s.setActiveTab)
  const { fields, activeFieldId, setActiveFieldId } = useFieldStore()

  const {
    points,
    searchQuery,
    selectedType,
    sortOrder,
    deletePoint,
    setSearchQuery,
    setSelectedType,
    setSortOrder,
    setFocusedPoint,
  } = usePointStore()

  // Фільтрація та сортування списку точок
  const filteredPoints = useMemo(() => {
    let result = [...points]

    // Фільтр за типом
    if (selectedType !== 'ALL') {
      result = result.filter((p) => p.type === selectedType)
    }

    // Пошук за описом, MGRS, назвою типу або назвою поля
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((p) => {
        const typeLabel = POINT_TYPE_CONFIGS[p.type]?.label.toLowerCase() || ''
        const field = fields.find((f) => f.properties.id === p.fieldId)
        const fieldName = field?.properties.name.toLowerCase() || ''
        return (
          p.description?.toLowerCase().includes(q) ||
          p.mgrs.toLowerCase().includes(q) ||
          typeLabel.includes(q) ||
          fieldName.includes(q)
        )
      })
    }

    // Сортування за датою
    result.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime()
      const timeB = new Date(b.createdAt).getTime()
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB
    })

    return result
  }, [points, selectedType, searchQuery, sortOrder, fields])

  return (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200 overflow-hidden">
      {/* Семантичний header сайдбара */}
      <header className="p-4  bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 tracking-tight">AgTech Fields GIS</h1>
              <p className="text-[11px] text-slate-500">Управління полями та моніторингом</p>
            </div>
          </div>

          {/* Додаткові фічі: Експорт/Імпорт даних */}
          <div className="flex items-center gap-1.5">
            <ExportPointsButton points={filteredPoints} />
          </div>
        </div>
      </header>

      <div
        className="flex-1 overflow-y-auto p-4 pr-1.5 space-y-6"
        style={{
          scrollbarGutter: 'stable',
        }}
      >
        {/* Секція 1: Сільськогосподарські поля */}
        <section aria-labelledby="fields-heading">
          <div className="flex items-center justify-between mb-2.5">
            <h2
              id="fields-heading"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              <Layers className="w-4 h-4 text-emerald-600" />
              Сільгосп поля ({fields.length})
            </h2>
          </div>

          {/* Семантичний список полів ul / li */}
          <ul role="list" className="grid gap-2 p-0 m-0 list-none">
            {fields.map((field) => {
              const isActive = field.properties.id === activeFieldId
              const fieldPointsCount = points.filter((p) => p.fieldId === field.properties.id).length

              return (
                <li key={field.properties.id}>
                  <FieldCard
                    field={field}
                    isActive={isActive}
                    pointsCount={fieldPointsCount}
                    onSelect={() => {
                      setFocusedPoint(null)
                      setActiveFieldId(field.properties.id)
                      setActiveTab('map')
                      onSelectField?.()
                    }}
                  />
                </li>
              )
            })}
          </ul>
        </section>

        {/* Секція 2: Точки моніторингу */}
        <section aria-labelledby="points-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2
              id="points-heading"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              <MapPin className="w-4 h-4 text-indigo-600" />
              Моніторингові точки ({filteredPoints.length})
            </h2>

            <ResetDataButton />
          </div>

          {/* Фіча фільтрації та пошуку */}
          <PointsFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            sortOrder={sortOrder}
            onSortToggle={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          />

          {/* Семантичний список точок ul / li */}
          {filteredPoints.length === 0 ? (
            <div className="p-6 text-center bg-white rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
              Точок не знайдено
            </div>
          ) : (
            <ul role="list" className="space-y-2 p-0 m-0 list-none">
              {filteredPoints.map((point) => {
                const pointField = fields.find((f) => f.properties.id === point.fieldId)
                return (
                  <li key={point.id}>
                    <PointCard
                      point={point}
                      fieldName={pointField?.properties.name}
                      onSelect={() => {
                        setActiveFieldId(point.fieldId)
                        setFocusedPoint(point)
                        setActiveTab('map')
                        onSelectPoint?.()
                      }}
                      onDelete={() => deletePoint(point.id)}
                    />
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
