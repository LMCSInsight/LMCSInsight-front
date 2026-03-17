import { type ComponentProps } from "react";
import { Form as AntForm } from "antd";

export function Form(props: ComponentProps<typeof AntForm>) {
  return <AntForm {...props} />;
}

export type { FormProps } from "antd";
