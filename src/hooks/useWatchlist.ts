import { useReducer, useCallback, useEffect } from 'react';

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  favorite: boolean;
  alerts: WatchlistAlert[];
  addedAt: Date;
}

export interface WatchlistAlert {
  id: string;
  type: 'price_above' | 'price_below' | 'volume_spike' | 'change_percent';
  value: number;
  enabled: boolean;
  triggered: boolean;
}

interface WatchlistState {
  items: WatchlistItem[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  sortBy: 'symbol' | 'price' | 'change' | 'volume' | 'addedAt';
  sortOrder: 'asc' | 'desc';
  filter: 'all' | 'favorites' | 'alerts';
}

type WatchlistAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_ITEM'; payload: Omit<WatchlistItem, 'id' | 'addedAt'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_ITEM'; payload: { id: string; updates: Partial<WatchlistItem> } }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'UPDATE_PRICE'; payload: { symbol: string; price: number; change: number; volume: number } }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SORT'; payload: { by: WatchlistState['sortBy']; order: WatchlistState['sortOrder'] } }
  | { type: 'SET_FILTER'; payload: WatchlistState['filter'] }
  | { type: 'ADD_ALERT'; payload: { itemId: string; alert: Omit<WatchlistAlert, 'id'> } }
  | { type: 'REMOVE_ALERT'; payload: { itemId: string; alertId: string } }
  | { type: 'TOGGLE_ALERT'; payload: { itemId: string; alertId: string } }
  | { type: 'TRIGGER_ALERT'; payload: { itemId: string; alertId: string } }
  | { type: 'LOAD_ITEMS'; payload: WatchlistItem[] }
  | { type: 'CLEAR_ALL' };

const initialState: WatchlistState = {
  items: [],
  loading: false,
  error: null,
  searchQuery: '',
  sortBy: 'addedAt',
  sortOrder: 'desc',
  filter: 'all'
};

function watchlistReducer(state: WatchlistState, action: WatchlistAction): WatchlistState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'ADD_ITEM':
      const newItem: WatchlistItem = {
        ...action.payload,
        id: `watchlist_${Date.now()}_${Math.random()}`,
        addedAt: new Date()
      };
      return {
        ...state,
        items: [...state.items, newItem],
        error: null
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates }
            : item
        )
      };

    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload
            ? { ...item, favorite: !item.favorite }
            : item
        )
      };

    case 'UPDATE_PRICE':
      return {
        ...state,
        items: state.items.map(item =>
          item.symbol === action.payload.symbol
            ? {
                ...item,
                price: action.payload.price,
                change: action.payload.change,
                volume: action.payload.volume
              }
            : item
        )
      };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'SET_SORT':
      return {
        ...state,
        sortBy: action.payload.by,
        sortOrder: action.payload.order
      };

    case 'SET_FILTER':
      return { ...state, filter: action.payload };

    case 'ADD_ALERT':
      const newAlert: WatchlistAlert = {
        ...action.payload.alert,
        id: `alert_${Date.now()}_${Math.random()}`
      };
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.itemId
            ? { ...item, alerts: [...item.alerts, newAlert] }
            : item
        )
      };

    case 'REMOVE_ALERT':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.itemId
            ? {
                ...item,
                alerts: item.alerts.filter(alert => alert.id !== action.payload.alertId)
              }
            : item
        )
      };

    case 'TOGGLE_ALERT':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.itemId
            ? {
                ...item,
                alerts: item.alerts.map(alert =>
                  alert.id === action.payload.alertId
                    ? { ...alert, enabled: !alert.enabled }
                    : alert
                )
              }
            : item
        )
      };

    case 'TRIGGER_ALERT':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.itemId
            ? {
                ...item,
                alerts: item.alerts.map(alert =>
                  alert.id === action.payload.alertId
                    ? { ...alert, triggered: true }
                    : alert
                )
              }
            : item
        )
      };

    case 'LOAD_ITEMS':
      return {
        ...state,
        items: action.payload,
        loading: false,
        error: null
      };

    case 'CLEAR_ALL':
      return {
        ...state,
        items: [],
        error: null
      };

    default:
      return state;
  }
}

export function useWatchlist() {
  const [state, dispatch] = useReducer(watchlistReducer, initialState);

  // Actions
  const addItem = useCallback((item: Omit<WatchlistItem, 'id' | 'addedAt'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  }, []);

  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<WatchlistItem>) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { id, updates } });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: id });
  }, []);

  const updatePrice = useCallback((symbol: string, price: number, change: number, volume: number) => {
    dispatch({ type: 'UPDATE_PRICE', payload: { symbol, price, change, volume } });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  const setSort = useCallback((by: WatchlistState['sortBy'], order: WatchlistState['sortOrder']) => {
    dispatch({ type: 'SET_SORT', payload: { by, order } });
  }, []);

  const setFilter = useCallback((filter: WatchlistState['filter']) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  }, []);

  const addAlert = useCallback((itemId: string, alert: Omit<WatchlistAlert, 'id'>) => {
    dispatch({ type: 'ADD_ALERT', payload: { itemId, alert } });
  }, []);

  const removeAlert = useCallback((itemId: string, alertId: string) => {
    dispatch({ type: 'REMOVE_ALERT', payload: { itemId, alertId } });
  }, []);

  const toggleAlert = useCallback((itemId: string, alertId: string) => {
    dispatch({ type: 'TOGGLE_ALERT', payload: { itemId, alertId } });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  // Computed values
  const filteredAndSortedItems = useCallback(() => {
    let filtered = state.items;

    // Apply search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.symbol.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    switch (state.filter) {
      case 'favorites':
        filtered = filtered.filter(item => item.favorite);
        break;
      case 'alerts':
        filtered = filtered.filter(item => item.alerts.some(alert => alert.enabled));
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (state.sortBy) {
        case 'symbol':
          comparison = a.symbol.localeCompare(b.symbol);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'change':
          comparison = a.change - b.change;
          break;
        case 'volume':
          comparison = a.volume - b.volume;
          break;
        case 'addedAt':
          comparison = a.addedAt.getTime() - b.addedAt.getTime();
          break;
      }
      
      return state.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [state.items, state.searchQuery, state.filter, state.sortBy, state.sortOrder]);

  // Statistics
  const stats = useCallback(() => {
    const total = state.items.length;
    const favorites = state.items.filter(item => item.favorite).length;
    const withAlerts = state.items.filter(item => item.alerts.some(alert => alert.enabled)).length;
    const triggered = state.items.filter(item => item.alerts.some(alert => alert.triggered)).length;

    return { total, favorites, withAlerts, triggered };
  }, [state.items]);

  // Load items from storage on mount
  useEffect(() => {
    const loadStoredItems = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const stored = localStorage.getItem('trading_watchlist');
        if (stored) {
          const items = JSON.parse(stored).map((item: any) => ({
            ...item,
            addedAt: new Date(item.addedAt)
          }));
          dispatch({ type: 'LOAD_ITEMS', payload: items });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Failed to load watchlist:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load watchlist' });
      }
    };

    loadStoredItems();
  }, []);

  // Save items to storage when items change
  useEffect(() => {
    if (state.items.length > 0) {
      try {
        localStorage.setItem('trading_watchlist', JSON.stringify(state.items));
      } catch (error) {
        console.error('Failed to save watchlist:', error);
      }
    }
  }, [state.items]);

  return {
    // State
    items: filteredAndSortedItems(),
    allItems: state.items,
    loading: state.loading,
    error: state.error,
    searchQuery: state.searchQuery,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
    filter: state.filter,
    
    // Actions
    addItem,
    removeItem,
    updateItem,
    toggleFavorite,
    updatePrice,
    setSearchQuery,
    setSort,
    setFilter,
    addAlert,
    removeAlert,
    toggleAlert,
    clearAll,
    
    // Computed
    stats: stats()
  };
} 