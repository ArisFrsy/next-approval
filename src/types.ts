import type { i18n } from "@/configs/i18n";
import type { LucideIcon, icons } from "lucide-react";
import type { ComponentType, SVGAttributes } from "react";
import type { radii, themes } from "./configs/themes";

export type LayoutType = "vertical" | "horizontal";

export type ModeType = "light" | "dark" | "system";

export type OrientationType = "vertical" | "horizontal";

export type DirectionType = "ltr" | "rtl";

export type LocaleType = (typeof i18n)["locales"][number];

export type ThemeType = keyof typeof themes;

export type RadiusType = (typeof radii)[number];

export type SettingsType = {
  theme: ThemeType;
  mode: ModeType;
  radius: RadiusType;
  layout: LayoutType;
  locale: LocaleType;
};

export interface IconProps extends SVGAttributes<SVGElement> {
  children?: never;
  color?: string;
}

export type IconType = ComponentType<IconProps> | LucideIcon;

export type DynamicIconNameType = keyof typeof icons;

export interface UserType {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  password: string;
  username: string;
  role: string;
  avatar: string;
  background: string;
  status: string;
  phoneNumber: string;
  email: string;
  state: string;
  country: string;
  address: string;
  zipCode: string;
  language: string;
  timeZone: string;
  currency: string;
  organization: string;
  twoFactorAuth: boolean;
  loginAlerts: boolean;
  accountReoveryOption?: "email" | "sms" | "codes";
  connections: number;
  followers: number;
}

export interface RouteType {
  type: "guest" | "public";
  exceptions?: string[];
}

export interface NotificationType {
  unreadCount: number;
  notifications: Array<{
    id: string;
    iconName: DynamicIconNameType;
    content: string;
    url: string;
    date: string;
    isRead: boolean;
  }>;
}

export type FormatStyleType = "percent" | "duration" | "currency" | "regular";

export interface NavigationType {
  title: string;
  items: NavigationRootItem[];
}

export type NavigationRootItem =
  | NavigationRootItemWithHrefType
  | NavigationRootItemWithItemsType;

export interface NavigationRootItemBasicType {
  title: string;
  label?: string;
  iconName: DynamicIconNameType;
}

export interface NavigationRootItemWithHrefType
  extends NavigationRootItemBasicType {
  href: string;
  items?: never;
}

export interface NavigationRootItemWithItemsType
  extends NavigationRootItemBasicType {
  items: (
    | NavigationNestedItemWithHrefType
    | NavigationNestedItemWithItemsType
  )[];
  href?: never;
}

export interface NavigationNestedItemBasicType {
  title: string;
  label?: string;
}

export interface NavigationNestedItemWithHrefType
  extends NavigationNestedItemBasicType {
  href: string;
  items?: never;
}

export interface NavigationNestedItemWithItemsType
  extends NavigationNestedItemBasicType {
  items: (
    | NavigationNestedItemWithHrefType
    | NavigationNestedItemWithItemsType
  )[];
  href?: never;
}

export type NavigationNestedItem =
  | NavigationNestedItemWithHrefType
  | NavigationNestedItemWithItemsType;

export interface OAuthLinkType {
  href: string;
  label: string;
  icon: IconType;
}

export interface FileType {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}
