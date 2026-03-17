import { Modal as AntModal, type ModalProps } from "antd";

export function Modal(props: ModalProps) {
  return <AntModal {...props} />;
}

export type { ModalProps } from "antd";
