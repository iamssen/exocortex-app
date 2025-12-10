# React Code Review: 2025-12-10

이 문서는 `exocortex-app` 프로젝트 코드에서 React 18 및 19의 신기능을 활용하여 개선할 수 있는 구조적 변경 사항을 제안합니다. 현재 프로젝트는 이미 `react@19`를 디펜던시로 사용하고 있으므로, 별도의 업그레이드 없이 바로 적용 가능한 제안들입니다.

## 1. Data Fetching & Suspense (High Priority)

현재 코드는 `useQuery`의 데이터를 받아 `if (!data) return null` 또는 `data?.property` 형태로 조건부 렌더링을 수행하고 있습니다. 이는 컴포넌트 트리 깊은 곳까지 `undefined` 체크를 강제하며, 로딩 상태 처리가 분산되는 원인이 됩니다.

### **Current Pattern (`src/pages/holdings/View.tsx`)**

```tsx
const { data: financeData } = useQuery(api(`portfolio`));

const holdings = useMemo(() => {
  return financeData
    ? joinHoldingsAndQuotes(...)
    : undefined; // 데이터가 로딩 중일 때 undefined 반환
}, [financeData, ...]);

return (
  <>
    {holdings?.gain && ( ... )} {/* UI 렌더링 시마다 undefined 체크 필요 */}
  </>
);
```

### **Recommended: Suspense**

React 18+ Suspense를 도입하여 로딩 상태를 선언적으로 처리하고, 컴포넌트 내부에서는 데이터가 반드시 존재함을 보장받을 수 있습니다.

```tsx
// 1. useSuspenseQuery 사용 (tanstack query v5)
const { data: financeData } = useSuspenseQuery(api(`portfolio`));
// financeData는 항상 존재함 (로딩 중엔 Suspense fallback 표시)

const holdings = useMemo(() => {
  // undefined 체크 불필요
  return joinHoldingsAndQuotes(...);
}, [financeData, ...]);

return (
  <>
    <header>...</header> {/* 조건부 렌더링 제거 */}
  </>
);
```

**Action Item:**

- `View` 컴포넌트를 감싸는 상위 라우트(`HoldingsPage.tsx` 등)에 `<Suspense fallback={<Loading />}>` 추가.
- `useQuery`를 `useSuspenseQuery`로 교체하거나 `suspense: true` 옵션 활성화.

---

## 2. Remove "Effect for State Syncing" (Medium Priority)

Props로 전달받은 값을 내부 State로 동기화하기 위해 `useEffect`를 사용하는 패턴이 발견되었습니다. 이는 React 공식 문서에서도 지양하는 안티 패턴으로, 불필요한 리렌더링을 유발하고 데이터 흐름을 복잡하게 만듭니다.

### **Current Pattern (`src/@ui/components/FilterTextForm.tsx`)**

```tsx
const [tempFilterText, setTempFilterText] = useState('');

useEffect(() => {
  setTempFilterText(filterText);
}, [filterText]); // Props 변경 시 State 강제 업데이트
```

### **Recommended: Derived State or Key Reset**

1. **Key Reset:** 만약 `filterText`가 변경될 때 폼이 완전히 리셋되어야 한다면, 부모 컴포넌트에서 `key`를 변경하여 컴포넌트를 재생성하는 것이 깔끔합니다.
   ```tsx
   <FilterTextForm key={filterText} filterText={filterText} ... />
   ```
2. **Controlled Only:** 만약 부모의 `filterText`가 source of truth라면 굳이 내부 state를 `useEffect`로 동기화하지 말고, 입력 중인 상태만 분리하거나(uncontrolled + submit), 부모 상태를 바로 업데이트하도록 변경해야 합니다.

---

## 3. Concurrent Rendering for Complex Grids (Performance)

`HoldingsGrid`와 같이 데이터 양이 많거나 필터링/정렬 연산이 무거운 컴포넌트에서 React 18의 Concurrent Features를 활용하면 UI 반응성을 높일 수 있습니다.

### **Current Pattern (`src/@ui/grids/HoldingsGrid/index.tsx`)**

```tsx
const sortedRows = useMemo(() => {
  return rows.filter(...).toSorted(...); // 무거운 연산
}, [rows, perspective]);
```

사용자가 View Perspective를 변경할 때 이 연산이 메인 스레드를 차단하여 UI 전환이 끊길 수 있습니다.

### **Recommended: `useDeferredValue` or `useTransition`**

**Option A: `useDeferredValue` (결과 지연)**
정렬된 결과가 준비될 때까지 이전 화면을 유지하여 입력 반응성을 보장합니다.

```tsx
const deferredRows = useDeferredValue(rows);
const sortedRows = useMemo(() => {
  return deferredRows.filter(...).toSorted(...);
}, [deferredRows, perspective]);
```

**Option B: `useTransition` (상태 업데이트 우선순위 낮춤)**
Perspective 변경을 transition으로 감싸서 클릭 반응성을 최우선으로 처리합니다.

```tsx
// View.tsx
const [isPending, startTransition] = useTransition();

// ...
<button onClick={() => startTransition(() => setPerspective('daysGain'))}>
```

---

## 4. Minor React 19 Improvements

- **Ref Cleanup**: `SingleDateSelect.tsx` 등에서 `useEffect` 내의 DOM 조작이 있습니다. React 19는 `ref` cleanup 함수를 지원하므로, `<div ref={(node) => { ... return () => cleanup() }} />` 형태의 callback ref 패턴이 더 강력해졌습니다. 다만 현재 코드의 `useEffect` 패턴도 충분히 유효하므로 우선순위는 낮습니다.
- **Context API**: 만약 Context Provider를 사용하는 곳이 있다면 `<Context.Provider value={...}>` 대신 `<Context value={...}>`로 간소화할 수 있습니다.

## 요약

| File Path                               | Issue                                  | Recommendation                             | Priority   |
| --------------------------------------- | -------------------------------------- | ------------------------------------------ | ---------- |
| `src/pages/holdings/View.tsx`           | Conditional rendering using `useQuery` | **Adopt Suspense** & `useSuspenseQuery`    | High       |
| `src/@ui/components/FilterTextForm.tsx` | `useEffect` for state syncing          | Use **Key Reset** pattern or remove effect | Medium     |
| `src/@ui/grids/HoldingsGrid/index.tsx`  | Expensive sorting in render path       | Use **`useDeferredValue`** for rows        | Low/Medium |
