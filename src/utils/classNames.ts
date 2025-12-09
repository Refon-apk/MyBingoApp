/**
 * 条件付きのクラス名を1つの文字列にまとめるユーティリティ。
 */
function classNames(...values: Array<string | false | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export default classNames;
