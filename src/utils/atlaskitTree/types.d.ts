import { TreeData } from "@atlaskit/tree"

export type Items = TreeData["items"]
export interface FlatItem {
  id: number,
  name: string,
  sourceId: number
}