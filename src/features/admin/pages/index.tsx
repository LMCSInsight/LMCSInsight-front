import { useTranslation } from 'react-i18next'

export default function AdminPage() {
  const { t } = useTranslation()
  return <div>{t('admin.portal')}</div>
}
