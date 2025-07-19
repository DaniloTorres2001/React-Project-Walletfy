import {
  notifications as mantineNotifications,
  type NotificationData,
} from '@mantine/notifications'

const notificationStyles: NotificationData['styles'] = {
  title: {
    fontSize: '1.15rem',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  description: {
    fontSize: '1rem',
    lineHeight: 1.5,
  },
}

const show = (params: NotificationData) => {
  mantineNotifications.show({
    ...params,
    color: params.color || 'blue',
    autoClose: params.autoClose ?? 5000,
    withBorder: params.withBorder ?? true,
    withCloseButton: params.withCloseButton ?? true,
    styles: {
      ...notificationStyles,
      ...(params.styles || {}),
    },
  })
}

const update = (params: NotificationData) => {
  mantineNotifications.update({
    ...params,
    styles: {
      ...notificationStyles,
      ...(params.styles || {}),
    },
  })
}

const hide = (id: string) => {
  mantineNotifications.hide(id)
}

const clean = () => {
  mantineNotifications.clean()
}

const cleanQueue = () => {
  mantineNotifications.cleanQueue()
}

const success = (params: Omit<NotificationData, 'color'>) => {
  show({ ...params, color: 'green' })
}

const error = (params: Omit<NotificationData, 'color' | 'autoClose'>) => {
  show({ ...params, color: 'red', autoClose: 15000 })
}

const info = (params: Omit<NotificationData, 'color'>) => {
  show({ ...params, color: 'blue' })
}

const warning = (params: Omit<NotificationData, 'color'>) => {
  show({ ...params, color: 'yellow' })
}

export const notifications = {
  show,
  update,
  hide,
  clean,
  cleanQueue,
  success,
  error,
  info,
  warning,
}
