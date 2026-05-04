// src/shared/components/ConfirmDeleteModal.tsx
import { Modal, Button, Typography } from 'antd'
import { WarningOutlined } from '@ant-design/icons'

const { Text } = Typography

const C = {
  navy: '#21334E',
  bg: '#EBF1F9',
  white: '#FFFFFF',
  border: '#d9d9d9',
}
const FONT = "'DM Sans Variable', system-ui, sans-serif"

interface ConfirmDeleteModalProps {
  open: boolean
  entity: 'encadrement' | 'étudiant'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDeleteModal({
  open,
  entity,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  return (
    <Modal
      open={open}
      footer={null}
      closable={false}
      centered
      width={480}
      styles={{
        body: {
          background: C.bg,
          borderRadius: 12,
          padding: '32px 36px',
          fontFamily: FONT,
        },
      }}
    >
      <div style={{ textAlign: 'center' }}>
        {/* Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 12,
          }}
        >
          <WarningOutlined style={{ fontSize: 22, color: '#f5a623' }} />
          <Text
            strong
            style={{
              fontFamily: FONT,
              fontSize: 16,
              color: C.navy,
              fontWeight: 700,
            }}
          >
            Êtes-vous sûr de vouloir supprimer cet {entity} ?
          </Text>
        </div>

        {/* Subtitle */}
        <Text
          style={{
            fontFamily: FONT,
            fontSize: 13,
            color: C.navy,
            display: 'block',
            marginBottom: 28,
            lineHeight: 1.6,
          }}
        >
          Cette action est irréversible. Les données seront
          <br />
          définitivement supprimées.
        </Text>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          <Button
            onClick={onCancel}
            style={{
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 13,
              height: 38,
              paddingInline: 28,
              borderRadius: 6,
              backgroundColor: C.navy,
              borderColor: C.navy,
              color: C.white,
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={onConfirm}
            style={{
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 13,
              height: 38,
              paddingInline: 28,
              borderRadius: 6,
              backgroundColor: C.navy,
              borderColor: C.navy,
              color: C.white,
            }}
          >
            Supprimer
          </Button>
        </div>
      </div>
    </Modal>
  )
}
