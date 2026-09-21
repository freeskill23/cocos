export type DesignId = "c1" | "c2" | "c3";

export interface DesignConfig {
  id: DesignId;
  code: string;
  nameKr: string;
  nameEn: string;
  description: string;
  extraPrice: number;
  image: string;
}

export const DESIGNS: DesignConfig[] = [
  {
    id: "c1",
    code: "C1",
    nameKr: "클래식",
    nameEn: "CLASSIC",
    description: "기본형 강아지집. 가장 심플하고 보편적인 디자인.",
    extraPrice: 0,
    image: "/design-c1-classic.webp",
  },
  {
    id: "c2",
    code: "C2",
    nameKr: "오픈",
    nameEn: "OPEN",
    description: "전면 개방형. 개방감이 필요한 반려견에게 적합.",
    extraPrice: 20000,
    image: "/design-c2-open.webp",
  },
  {
    id: "c3",
    code: "C3",
    nameKr: "테이블",
    nameEn: "TABLE",
    description: "상판을 사이드테이블 또는 협탁처럼 활용할 수 있는 디자인.",
    extraPrice: 40000,
    image: "/design-c3-table.webp",
  },
];

export const DEFAULT_DESIGN_ID: DesignId = "c1";
