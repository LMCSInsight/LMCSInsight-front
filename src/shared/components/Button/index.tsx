import { Button as AntButton, type ButtonProps as AntButtonProps } from "antd";

export function Button(props: AntButtonProps) {
  return <AntButton {...props} />;
}

export type { ButtonProps } from "antd";
