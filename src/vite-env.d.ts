declare module "*module.css" {
  const content: { [className: string]: string };
  export = content;
}

declare module "*.css";
declare module "*.scss";
