/* This is a hook for loading filtered bookings */

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';

import { createInitialState, reducer, updateBookings, setDate, setDayBefore, setDayAfter, changeBooleanFilter, changeDuoFilter, changeOutcallFilter, changeStatusFilter, changeFilterId, resetDate, changeSorting, setPending, setExtraState, setQuery, resetQuery, resetFilter, resetAllFilters } from '../store/reducer'import selectors from '../selectors/selectors';


import API from 'api/api';
import { usePrevious } from 'hooks';
import {
  BOOKING_FILTERS,
  BOOKING_FILTERS_NAMES,
  BOOKING_SELECT_FILTERS,
  BOOKING_SELECT_FILTERS_NAMES,
  BOOKING_STATUS_FILTERS,
  BOOKING_STATUS_FILTERS_NAMES,
  NO_BOOKINGS_LABELS,
} from '../config/constants';
import { selectUserTimezone } from 'redux/selectors/selectors';
import convertToOptimizeBooking from 'utils/convertToOptimizeBooking';
import getConfigForOptimizedBookingsApi from 'utils/getConfigForOptimizedBookingsApi';
import { useEnchancedReducer } from 'hooks/useEnchancedReducer';
import isWithinDate from '../utils/isWithinDate';
import getDateConfig from '../utils/getDateConfig';
import { getDateByTimezoneOffset } from 'utils';
import { updateBookings as updateBookingsInRedux } from 'redux/ducks/bookings';
import getActualDate from '../utils/getActualDate';
import convertDateToBookingsKey from '../utils/convertDateToBookingsKey';


const scrollToBooking = (bookingDomElement) => {
  bookingDomElement.scrollIntoView();
  bookingDomElement.setAttribute('data-isanimate', 'true');
  setTimeout(() => {
    bookingDomElement.setAttribute('data-isanimate', 'false')
  }, 4000);
}

const SELECT_FILTERS_WITH_FILTER_PROPS = [
  BOOKING_SELECT_FILTERS_NAMES.client,
  BOOKING_SELECT_FILTERS_NAMES.girl
]


export const useFilteredBookings = (config) => {
  const userTimezone = useSelector(selectUserTimezone);
  const totalBookings = useSelector((state) => state.bookings.entities);

  const bookingsRef = useRef({});

  const {
    extraConfig,
    boundaryDays,
    separatedBookingsByDay,
    separatedFiltersByDay,
    isAutoScrollToActualTime,
    duringAllTime,
    limit = 30,
  } = config instanceof Function ? config() : config;
  const filtersByDayCount = separatedFiltersByDay ? boundaryDays : 1;
  
  const initialstate = createInitialState(filtersByDayCount, duringAllTime, userTimezone);
  const [state, dispatch] = useEnchancedReducer(reducer, initialstate, selectors);
    
  const { filters: { searchQuery, date: actualDate, currentDate } } = state;

  let boundaryDate, splitedDate;
  
  if (!duringAllTime) {
    boundaryDate = state.getBoundaryDate(boundaryDays);
    splitedDate = state.getSplitedDate(separatedBookingsByDay, boundaryDays);
  }

  const reduxDispatch = useDispatch();

  const previousSplitedDate = usePrevious(splitedDate);
  
  /* Bind all filter props to function for passing it */

  const getFilterProps = (date) => {
    const { getBookingFilters } = state;
    const filters = getBookingFilters(date);
    const apiConfig = getConfigForOptimizedBookingsApi(filters);
    const dateConfig = getDateConfig(date);

    return { ...apiConfig, ...dateConfig, limit, ...extraConfig };
  }

  /* After updated day side effect logic */

  const afterUpdatedDayCallbacks = {};

  const saveCallbackByDate = (callback, date) => {
    const actualDate = date || boundaryDate;

    afterUpdatedDayCallbacks[actualDate] = callback;
  }

  const executeCallbackAfterUpdatedDay = (bookings, date) => {
    const bookingIds = bookings.map((booking) => booking.id);
    const filters = getFilterProps(date);
    const callback = afterUpdatedDayCallbacks[date];
		
    callback && callback(bookingIds, filters);
  }

  /* Update bookings either by days or by specific date range or without date */

  const loadFilteredBoookingsByDate = (offset, date) => {
    if (!offset) dispatch(setPending(date, true));

    return API.getOptimizedBookingsByDate({ ...getFilterProps(date), offset, limit })
      .then(({ data }) => {
        const { bookings } = data;
        const optBookingsList = data.bookings.map(convertToOptimizeBooking) || [];

        reduxDispatch(updateBookingsInRedux(optBookingsList));
        dispatch(updateBookings(data, date, Boolean(offset)))

        return { bookings };
      })
      .catch(console.error)
      .finally(() => {
        if (!offset) dispatch(setPending(date, false));
      })
  }

  async function* loadFilteredBookings ({ pickedDate = splitedDate, offset } = {}) {
    const formatedPickedDate = Array.isArray(pickedDate) ? pickedDate : [pickedDate];
    const promiseIndexes = [];

    if (boundaryDate && !isWithinDate(formatedPickedDate[0], boundaryDate)) return;

    if (!duringAllTime) {
      let loadBookingPromises = formatedPickedDate.map((date, index) => {
        return loadFilteredBoookingsByDate(offset, date)
        	.then(({ bookings }) => ({ index, date, bookings }))
      });

      while (promiseIndexes.length !== loadBookingPromises.length) {
        const filteredBookingPromises = loadBookingPromises.filter((_, i) => !promiseIndexes.includes(i));
        const result = await Promise.any(filteredBookingPromises);
        promiseIndexes.push(result.index);
        yield result;
      }
    } else {
      yield await loadFilteredBoookingsByDate(offset);
    }
  }

  /* If you want to use memoization in your bookings check it out */

  const createExtraBookingstate = (date) => (value, bookingId) => {
  	const dateKey = convertDateToBookingsKey(date)
    const extraBookingstate = state.entities?.[dateKey]?.extraState?.[bookingId] || value;
    const setExtraBookingstate = (value) => dispatch(setExtraState(dateKey, bookingId, value))

		return [extraBookingstate, setExtraBookingstate];
  }

  /* Callback for autoscrolling to the booking that holds date corresponds to current one */

  const isDayAllowedToAutoScroll = () => {
    const isFirstDay = !splitedDate || splitedDate[0] === currentDate;
    const isFirstBookingsLoad = !state.filters.updatedDate;

    return isFirstDay && isFirstBookingsLoad && isAutoScrollToActualTime;
  }

  const handleScrollToActualTime = ({
    scrollTime = moment(getDateByTimezoneOffset(userTimezone)),
    bookings
  }) => {
    if (!isDayAllowedToAutoScroll()) return;
    if (!bookings.length) return;

    for (let booking of bookings) {
      const { id, duration } = booking;
      const [count, dimension] = duration.split(' ');
      const bookingDateByTimezone = getDateByTimezoneOffset(userTimezone, booking.date);
      const bookingDateWithDuration = moment(bookingDateByTimezone).add(Number(count), dimension);
      const bookingDomElement = bookingsRef.current[currentDate][id];
			
      if (bookingDateWithDuration.isAfter(scrollTime)) {
        return scrollToBooking(bookingDomElement);
      }
    }
    
		const lastBookingDomElement = bookingsRef.current[currentDate][bookings.at(-1).id];

    return scrollToBooking(lastBookingDomElement);
  };
  
  /* Side effect for sending request if filters were changed */

  useEffect(async () => {
    const { updatedDate } = state.filters;
    const datesDifference = _.difference(splitedDate, previousSplitedDate);
    const datesForUpdate = datesDifference.length ? datesDifference : updatedDate;

    const renderedBookingsGenerator = loadFilteredBookings({ pickedDate: datesForUpdate });

    for await (const { index, date, bookings } of renderedBookingsGenerator) {
      executeCallbackAfterUpdatedDay(bookings, date);
      index === 0 && handleScrollToActualTime({ bookings });
    }
  }, [state.filters])

  /* PROPS GETTERS fucntions for conducting props to components */

  const getters = new Proxy({}, {
    get(target, method) {
      return (props) => {
        const { getOverallPending } = state;
        const date = props?.date || boundaryDate;
        const pending = getOverallPending();
        const result = target[method]({ ...props, date, disabled: pending })

        const complexGetterNames = ['getFilterProps', 'getStatusFilterProps', 'getSelectProps'];
        const isNotReturnedGetterPropsObject = complexGetterNames.includes(method) ? props?.name : true;

        if (isNotReturnedGetterPropsObject) {
          return result;
        } else {
          return new Proxy(result, this);
        }
      }
    }
  })

  getters.getDateChangerProps = () => ({
    changeDateToPrev: () => dispatch(setDayBefore()),
    changeDateToNext: () => dispatch(setDayAfter()),
  })

  getters.getDateTimeChangerProps = () => ({
    date: boundaryDate,
    range: boundaryDays,
    setDate: (date) => dispatch(setDate(date)),
    ...getters.getDateChangerProps(),
  })

  getters.getSearchBookingsProps = () => ({
    searchQuery,
    startSearch: (query) => dispatch(setQuery(query)),
    stopSearch: () => dispatch(resetQuery()),
  })

  const getSimpleFilterProps = ({ name, date, ...restProps }) => ({
    onClick: () => dispatch(changeBooleanFilter(date, name)),
    active: state.getBookingFilters(date)[name],
    ...restProps
  })

  const getFinishedFilterProps = ({ name, date, ...restProps }) => ({
    onClick: () => dispatch(changeBooleanFilter(date, name)),
    active: state.getBookingFilters(date)[name],
    statusCount: state.getStatusCounters(date, BOOKING_FILTERS[name].label),
    ...BOOKING_FILTERS[name],
    ...restProps,
  })

  const getDuoFilterProps = ({ name, date, ...restProps }) => ({
    onClick: () => dispatch(changeDuoFilter(date)),
    active: state.getBookingFilters(date).meeting_type === 'duo',
    ...BOOKING_FILTERS[name],
    ...restProps,
  })

  const getOutcallFilterProps = ({ name, date, ...restProps }) => ({
    onClick: () => dispatch(changeOutcallFilter(date)),
    active: state.getBookingFilters(date).type === 'outcall',
    ...BOOKING_FILTERS[name],
    ...restProps
  })

  getters.getFilterProps = ({ name, date, ...restProps }) => {
    const getterProps = ({ name }) => ({
      [BOOKING_FILTERS_NAMES.prebooking]: getSimpleFilterProps({ name, date, ...restProps }),
      [BOOKING_FILTERS_NAMES.agent]: getSimpleFilterProps({ name, date, ...restProps }),
      [BOOKING_FILTERS_NAMES.finished]: getFinishedFilterProps({ name, date, ...restProps }),
      [BOOKING_FILTERS_NAMES.duo]: getDuoFilterProps({ name, date, ...restProps }),
      [BOOKING_FILTERS_NAMES.outcall]: getOutcallFilterProps({ name, date, ...restProps })
    })[name]

    if (name) {
      return getterProps({ name });
    } else {
      return { getterProps };
    }
  }

  getters.getStatusFilterProps = ({ name, date, ...restProps }) => {
    const getterProps = ({ name, restProps }) => {
      const { getBookingFilters, getStatusCounters, getBookingObject } = state;
    	const { confirmationStatus } = getBookingFilters(date);

      const { label, color } = BOOKING_STATUS_FILTERS[name];
      const isAllFilter = name === BOOKING_STATUS_FILTERS_NAMES.all;
      const active = isAllFilter ? !confirmationStatus : confirmationStatus === label;
      const statusCount = isAllFilter ? getBookingObject(date).bookingsTotal : getStatusCounters(date, label);
      const onClick = () => dispatch(changeStatusFilter(date, isAllFilter ? null : label));

      return { label, color, active, statusCount, onClick, ...restProps }
    }

    if (name) {
      return getterProps({ name, restProps });
    } else {
      return { getterProps };
    }
  }

  getters.getSelectProps = ({ date }) => {
    const getRequest = (name) => (requests) => {
      if (SELECT_FILTERS_WITH_FILTER_PROPS.includes(name)) {
        return (props) => requests[name]({ ...getFilterProps(splitedDate[0]), ...props });
      } else {
        return requests[name];
      }
    }

		const getterProps = ({ name, restProps }) => {
      const { getBookingFilters, isFiltersUpdated } = state;

      const props = BOOKING_SELECT_FILTERS[name];
      const filterValue = getBookingFilters(date)[name];
      const newRequest = getRequest(name);
      const updateFilters = (innerProps) => {
        dispatch(changeFilterId(date, props.filterName, innerProps?.value))
      };
  
      return { ...props, filterValue, isFiltersUpdated, updateFilters, newRequest, ...restProps };
    }

    return { getterProps };
  };

  getters.getTimeFiltersProps = ({ date }) => {
		const { getFilteredBookings } = state;
    const bookings = getFilteredBookings(date, totalBookings);

    return {
      onClick: (scrollTime) => handleScrollToActualTime({ scrollTime, bookings })
    }
  };

  getters.getTodayButtonProps = () => ({ onClick: () => dispatch(resetDate()) });

  getters.getFiltersContainerProps = ({ date }) => {
		const { getNumberOfBookings, isFiltersUpdated } = state;

    return {
      onReset: () => dispatch(resetFilter(date)),
      bookingsCount: getNumberOfBookings(date),
      isUpdated: isFiltersUpdated(date),
    }
  }

  getters.getSortOptionsProps = ({ date }) => {
		const { getBookingFilters } = state;

    return {
      onChangeSort: (sortOption) => dispatch(changeSorting(date, sortOption)),
      activeSortOption: getBookingFilters(date).sortOption,
      isAsk: getBookingFilters(date).sortOptionType === 'asc',
    }
  };

  getters.getBookingsCount = ({ date }) => {
    const { getBookingObject, isFiltersUpdated } = state;
    const bookingsByDate = getBookingObject(date);
    const totalCount = bookingsByDate.bookingsTotal;
    const actualCount = bookingsByDate.bookingIds?.length;

    return {
      currentCount: isFiltersUpdated(date) ? actualCount : totalCount,
      totalCount,
    }
  }

  getters.getBookingListProps = ({
    date,
    groupByDay,
    absentLabel = NO_BOOKINGS_LABELS.GENERAL,
    extraPending = false,
  }) => {
    const { getFilteredMessage, getFilteredBookings, getPending } = state;
  	const realBookingsLength = getFilteredBookings(date, totalBookings).length;
    const getAbsentLabel = {
      [NO_BOOKINGS_LABELS.GENERAL]: () => "(no bookings)",
      [NO_BOOKINGS_LABELS.CHOOSEN_FILTERS]: () => getFilteredMessage(date),
      [NO_BOOKINGS_LABELS.NO_LABEL]: () => ""
    }

		return {
      limit,
      list: getFilteredBookings(date, totalBookings, groupByDay),
      loadMore: (offset) => loadFilteredBookings({ pickedDate: [date], offset }).next(),
      listLoadPending: extraPending || getPending(date),
      absentLabel: getAbsentLabel[absentLabel](),
			useIndexAsItemKey: true,
      ...(groupByDay ? { realListLength: realBookingsLength } : {})
    }
  }

  getters.getBookingProps = ({ date }) => {
    bookingsRef.current[date] = {};
    
    return {
      getCallbackRef: (bookingId) => (node) => {
        bookingsRef.current[date][bookingId] = node
      },
      useExtraBookingState: createExtraBookingstate(date),
      onDelete: () => loadFilteredBookings({ pickedDate: date }).next()
    }
  }

  return {
    getters,
    date: splitedDate,
    actualDate: getActualDate(actualDate, userTimezone),
    isCurrentDate: currentDate === actualDate,
    resetFilters: () => dispatch(resetAllFilters(filtersByDayCount)),
    getFilterProps,
    loadFilteredBookings: ({ pickedDate }) => loadFilteredBookings({ pickedDate }).next(),
    useDayUpdated: saveCallbackByDate,
  }
}
