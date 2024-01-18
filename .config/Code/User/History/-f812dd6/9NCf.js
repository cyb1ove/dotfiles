import moment from 'moment';
import ICONS from 'assets/icons';
import API from 'api/api';

export const ROUTES = Object.freeze({
  login: '/login',
  twoFactor: '/two-factor',
  main: '/',
  sales: '/sales',
  adrBook: '/address-book',
  mail: '/mail',
  calendar: '/calendar',
});

export const CALENDAR_ROUTES = Object.freeze({
  weekView: 'weekView',
  twoDays: 'twoDays',
  timeline: 'timeline',
  calendar: 'calendar',
  table: 'table',
}) 

// Types of contacts in our db
export const CONTACT = 'contact';
export const OPERATOR = 'operator';
export const ROOM = 'room';

export const CONTACT_TABS = Object.freeze({
  CLIENTS: 'clients',
  GIRLS: 'girls',
  OPERATOR: 'operator'
});

export const CONTACT_TYPES = Object.freeze({
  CLIENT: 1,
  GIRL: 2,
  AGENT: 3,
  SERVICES: 4,
  RECEPTION: 5,
  MOBILE_OPERATOR: 6,
  OPERATOR: 9,
});

export const CONTACT_GROUPS = {
  'All Escorts': [CONTACT_TYPES.GIRL],
  'All Agents': [CONTACT_TYPES.AGENT],
  'Agents + Reception': [CONTACT_TYPES.AGENT, CONTACT_TYPES.RECEPTION],
}

export const ADR_BOOK_FILTERS = Object.freeze({
  ALL: 0,
  CLIENT: 1,
  GIRL: 2,
  AGENT: 3,
  SERVICES: 4,
  RECEPTION: 5,
  MOBILE_OPERATOR: 6,
});

export const INTERACTION_TYPES = Object.freeze({
  INCOMING_CALL: 1,
  OUTGOING_CALL: 2,
  OUTGOING_MSG: 3,
  INCOMING_MSG: 4,
  INCOMING_MMS: 5,
  OUTGOING_MMS: 6,
  REMINDER: 7,
  SYSTEM_MSG: 8,
  INCOMING_MSG_TELEGRAM: 9,
  OUTGOING_MSG_TELEGRAM: 10,
  INCOMING_MSG_WHATSAPP: 18,
  OUTGOING_MSG_WHATSAPP: 19,
  SCHEDULE_MESSAGE: 11,
  INCOMING_EMAIL: 12,
  MSG_ATTACHMENT: 'attachment' // FIXME
});

export const CHAT_TYPES = Object.freeze({
  CLIENT: 1,
  GIRL: 2,
  ROOM: 3,
  GIRLROOM: 4,
});

export const AUDIO_SETTINGS_TYPES = Object.freeze({
  NORMAL: 0,
  MUTE: 1,
  IMPORTANT: 2,
});

export const MSG_PEACES = Object.freeze({
  GIRL_NAME: 'girlName',
  MENTION: 'mention',
  LINK: 'link',
  TEXT: 'text'
});

export const CHAT_SOURCES = Object.freeze({
  MSGS: 'msgs',
  MEDIA: 'media',
  REMINDERS: 'reminders',
  SCHEDULED_MSGS: 'scheduled-msgs',
  SYSTEM_MSGS: 'system_msgs',
});

export const TITLE = 'ComDiva App';

export const CARD_TABS = Object.freeze({
  EDIT: 1,
  LOGS: 2,
  SESSIONS: 3,
});

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

export const CONTACTS_MODES_TYPES = Object.freeze({
  1: 'client',
  2: 'girl',
  3: 'agent',
  4: 'service'
});

export const ADDITIONAL_SESSION_FILTERS = Object.freeze({
  holidays: "on-holidays",
  banned: "include-banned",
  includeoff: "includeoff",
  sortby: "sortby",
  age: "filter-age_filter",
  breast: "filter-breast_filter",
  ethnicity: "filter-ethnicity",
  hair: "filter-hair",
  height: "filter-height_filter",
  location: "filter-location",
  search: "search",
  language: "filter-language",
  price: "filter-price_filter",
  dress: "filter-dress_filter",
  nationality: "filter-nationality",
  city: "filter-city",
  services: "filter-services",
});

export const RINGTONE_TYPES = Object.freeze({
  call: 101,
  sms: 102,
  booking: 109,
});

export const CLIENT_CATEGORY_OPTIONS = [
  { value: 'A', label: 'A', color: 'green' },
  { value: 'B', label: 'B', color: '#F2CC0C' },
  { value: 'C', label: 'C', color: 'red' },
  { value: null, label: '', color: 'grey' },
];

export const CLIENT_SUBTYPE_OPTIONS = [
  { value: 0, label: 'Client' },
  { value: 1, label: 'Black list' },
  { value: 2, label: 'Time waster'},
  { value: 3, label: 'Member' },
  { value: 4, label: 'Booked And Cancelled' },
];

export const BOOKING_LOCATION_TYPES = Object.freeze({
  HOTEL: '1',
  PRIVATE: '2',
});

export const MAX_CONFERENCE_PARTICIPANTS = 8;

export const CANCEL_BOOKING_REASONS = ["because of the client", "because of a girl", "because of the operator"];

export const MAIL_SEARCH_CONTACTS_LIMIT = 20;

export const USER_SETTINGS_TAGS_LIMIT = 80;
export const USER_SETTINGS_COLORS_LIMIT = 80;

export const CONTACTS_LIMIT = 20;

export const COMMUNICATION_CHANNEL = Object.freeze({
  twilio: 'twilio',
  dinstar: 'dinstar',
});

export const GOOGLE_MAPS_API_KEY = 'AIzaSyD6iXtUoYGxoVxygGv8xqeegzu5A2podCw';


export const BOOKING_STATUS_FILTERS_NAMES = {
  todo: 'todo',
  tosort: 'tosort',
  confirmed: 'confirmed',
  done: 'done',
  canceled: 'cancelled',
  all: 'all'
}

export const BOOKING_STATUS_FILTERS = {
  [BOOKING_STATUS_FILTERS_NAMES.todo]: {
    label: 'to do',
    color: '#FF5E57'
  },
  [BOOKING_STATUS_FILTERS_NAMES.tosort]: {
    label: 'to sort',
    color: '#FF8C37',
  },
  [BOOKING_STATUS_FILTERS_NAMES.confirmed]: {
    label: 'confirmed',
    color: '#2BC741',
  },
  [BOOKING_STATUS_FILTERS_NAMES.done]: {
    label: 'done',
    color: '#0092F2'
  },
  [BOOKING_STATUS_FILTERS_NAMES.canceled]: {
    label: 'cancelled',
    color: '#005947'
  },
	[BOOKING_STATUS_FILTERS_NAMES.all]: {
    label: 'all',
    color: 'inherit'
  }
}

export const BUTTON_THEMES = Object.freeze({
  primary: 'primary',
  secondary: 'secondary',
  inversion: 'inversion',
  'inversion-light': 'inversion-light',
  dim: 'dim',
  light: 'light',
  none: 'none', 
});

export const INPUT_THEMES = Object.freeze({
  primary: 'primary',
  dim: 'dim',
  ['dim-width-border']: 'dim-width-border',
  inversion: 'inversion'
})

export const CHAT_ACTION_MENUS = {
  VOICE_RECORDER: 'VOICE_RECORDER',
  TEMPLATES: 'TEMPLATES',
  SMILES: 'SMILES',
};

export const SEARCH_LIST_THEMES = Object.freeze({
  empty: 'empty',
  modal: 'modal',
})

export const VIDEO_FORMAT_REGEX = /(mp4|mov|avi|wmv|flv|mkv|m4v|webm|vob|ogv|3gp|mpeg|mpg|asf|m2ts|ts|mxf|f4v)$/i;
export const IMAGE_FORMAT_REGEX = /(jpeg|jpg|png|gif|bmp|tiff|webp|heif|heic|ico|svg)$/i;

export const SEND_DELAY_MSG = 10;   // seconds
export const SEND_DELAY_MSG_REPLY = 1;   // seconds

export const CHAT_TELEGRAM_GROUP = {
  1: 'bookings',
  2: 'commission',
};

export const MAIN_CLIENT_FILTERS_NAMES = {
  MY: 'my',
  ALL: 'all',
  PREBOOK: 'prebook',
  // BOT: 'bot',
  // MAILS: 'mails',
}

export const MAIN_GIRLS_FILTERS_NAMES = {
  ALL: 'all',
  SMS: 'SMS',
  T: 'T',
  TG: 'tg',
}

export const MAIN_CLIENT_FILTERS = [
  { name: MAIN_CLIENT_FILTERS_NAMES.MY, value: () => 'my'},
  { name: MAIN_CLIENT_FILTERS_NAMES.ALL, value: () => 'all'},
  { name: MAIN_CLIENT_FILTERS_NAMES.PREBOOK, value: () => <ICONS.p />},
  // { name: MAIN_CLIENT_FILTERS_NAMES.BOT, value: () => <ICONS.robot />},
  // { name: MAIN_CLIENT_FILTERS_NAMES.MAILS, value: () => <ICONS.mail />}
];

export const MAIN_GIRLS_FILTERS = [
  { name: MAIN_GIRLS_FILTERS_NAMES.ALL, value: () => 'all'},
  { name: MAIN_GIRLS_FILTERS_NAMES.SMS, value: () => 'SMS'},
  { name: MAIN_GIRLS_FILTERS_NAMES.T, value: () => 'T'},
  { name: MAIN_GIRLS_FILTERS_NAMES.TG, value: () => 'T.gr'},
]

export const DEVELOPERS_ID = Object.freeze({
  Alex: 5,
  Ivan: 39,
})

export const TOOLTIP_THEMES = Object.freeze({
  GENERAL: 'general',
  MAIN: 'main',
  DARK: 'dark',
})

export const BOOKING_STATUSES_NAMES = Object.freeze({
  CANCELLED: 'cancelled',
  PENDING: 'pending',
  IN_PROGRESS: 'in progress',
  FINISHED: 'finished',
  FEEDBACK_RECEIVED: 'feedback received',
  PRE_PENDING: 'pre-pending'
})

export const BOOKING_STATUSES = Object.freeze({
  [BOOKING_STATUSES_NAMES.CANCELLED]: {
    label: 'cancelled',
    id: 0,
  },
  [BOOKING_STATUSES_NAMES.PENDING]: {
    label: 'pending',
    id: 1,
  },
  [BOOKING_STATUSES_NAMES.IN_PROGRESS]: {
    label: 'in progress',
    id: 2,
  },
  [BOOKING_STATUSES_NAMES.FINISHED]: {
    label: 'finished',
    id: 3,
  },
  [BOOKING_STATUSES_NAMES.FEEDBACK_RECEIVED]: {
    label: 'feedback',
    id: 4,
  },
  [BOOKING_STATUSES_NAMES.PRE_PENDING]: {
    label: 'pre-pending',
    id: 5,
  },
})

export const PERMISSIONS = Object.freeze({
  ALL: "/*",
  GLOSSARY: "/api-admin/glossary/index",
})

export const INTERACTION_CHANNEL_TYPES = {
  TELEGRAM_INCOME: 9,
  TELEGRAM_OUTCOME: 10,
  SMS_INCOME: 13,
  SMS_OUTCOME: 14,
  WHATSAPP_INCOME: 18,
  WHATSAPP_OUTCOME: 19,
}
