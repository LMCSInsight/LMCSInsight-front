// src/shared/components/SuccessModal.tsx
import { Modal, Button, Typography } from 'antd'
import { CheckSquareFilled } from '@ant-design/icons'

const { Text } = Typography

const C = {
  navy: '#21334E',
  bg: '#EBF1F9',
  white: '#FFFFFF',
}
const FONT = "'DM Sans Variable', system-ui, sans-serif"

interface SuccessModalProps {
  open: boolean
  action: 'ajouté' | 'modifié' | 'supprimé'
  entity: 'Étudiant' | 'Encadrement'
  onClose: () => void
}

export function SuccessModal({
  open,
  action,
  entity,
  onClose,
}: SuccessModalProps) {
  return (
    <Modal
      open={open}
      footer={null}
      closable={false}
      centered
      width={420}
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
            marginBottom: 10,
          }}
        >
          <CheckSquareFilled style={{ fontSize: 22, color: '#22c55e' }} />
          <Text
            strong
            style={{
              fontFamily: FONT,
              fontSize: 16,
              color: C.navy,
              fontWeight: 700,
            }}
          >
            {entity} {action} avec succès
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
          }}
        >
          Les informations ont été enregistrées
        </Text>

        {/* Button */}
        <Button
          onClick={onClose}
          style={{
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 13,
            height: 38,
            paddingInline: 36,
            borderRadius: 6,
            backgroundColor: C.navy,
            borderColor: C.navy,
            color: C.white,
          }}
        >
          Fermé
        </Button>
      </div>
    </Modal>
  )
}
