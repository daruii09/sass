// 美术素材：通过 AI 图像生成 API 生成，运行时由浏览器加载（携带用户会话鉴权）
// 3D 渲染等距视角风格，真实美术素材，无代码绘制

const API = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image'

function img(prompt: string, size: string): string {
  return `${API}?prompt=${encodeURIComponent(prompt)}&image_size=${size}`
}

// 统一 3D 渲染风格前缀
const S = '3D isometric rendered game asset, ancient Chinese military theme, '
const TAIL = ', high detail, soft studio lighting, clean background, no text watermark'

export const ASSETS = {
  bg: {
    grassland: img('3D rendered isometric ancient Chinese grassland battlefield, rolling green hills, military tents and banners, winding dirt path, warm sunset, epic game scene' + TAIL, 'landscape_16_9'),
    desert: img('3D rendered isometric ancient Chinese desert battlefield, yellow sand dunes, beacon towers, distant snow mountains, blood red sun, epic' + TAIL, 'landscape_16_9'),
    snow: img('3D rendered isometric ancient Chinese snow mountain pass battlefield, frozen great wall, pine forest covered in snow, cold wind, epic' + TAIL, 'landscape_16_9'),
    river: img('3D rendered isometric ancient Chinese river town battlefield, waterways, willow trees, stone bridges, misty, epic' + TAIL, 'landscape_16_9'),
    capital: img('3D rendered isometric ancient Chinese imperial palace battlefield, grand halls, glazed tile roofs, towering walls, fire glow, epic' + TAIL, 'landscape_16_9'),
    hall: img('3D rendered ancient Chinese commanders tent interior, tiger tally, battle flags, sand table map, scrolls, candlelight, solemn' + TAIL, 'landscape_16_9'),
    splash: img('3D rendered epic ancient Chinese battlefield at dusk, setting sun, beacon smoke, silhouette of army, dramatic, cinematic' + TAIL, 'landscape_16_9'),
  },
  buildings: {
    castlePlayer: img(S + 'ancient Chinese fortress gatehouse, blue brick watchtower with battlements, isometric, standalone building' + TAIL, 'portrait_4_3'),
    castleEnemy: img(S + 'barbarian enemy camp, wooden palisade, watchtower, bone banners, rugged, isometric' + TAIL, 'portrait_4_3'),
    barracks: img(S + 'ancient Chinese military barracks tent, wooden frame, thatched roof, isometric' + TAIL, 'portrait_4_3'),
  },
  path: {
    dirt: img(S + 'single tile dirt road texture top view, brown ruts and footprints, grass edge, seamless' + TAIL, 'square'),
  },
  // 防御塔 3 级，每级样式不同
  towers: {
    archer1: img(S + 'tier 1 archer tower, simple wooden platform with arrowslit, small flag, isometric defense tower' + TAIL, 'portrait_4_3'),
    archer2: img(S + 'tier 2 archer tower, reinforced wooden tower with two levels, red canopy, larger, isometric defense tower' + TAIL, 'portrait_4_3'),
    archer3: img(S + 'tier 3 archer tower, grand multi-level pagoda tower with golden roof, ornate, isometric defense tower' + TAIL, 'portrait_4_3'),
    ballista1: img(S + 'tier 1 ballista battery, simple wooden crossbow mount on wheels, isometric siege weapon' + TAIL, 'portrait_4_3'),
    ballista2: img(S + 'tier 2 ballista battery, larger mounted heavy crossbow with iron frame, isometric siege weapon' + TAIL, 'portrait_4_3'),
    ballista3: img(S + 'tier 3 ballista battery, massive twin ballista with golden trim and reinforced steel, isometric siege weapon' + TAIL, 'portrait_4_3'),
    catapult1: img(S + 'tier 1 catapult, simple lever catapult on wooden frame, isometric siege weapon' + TAIL, 'portrait_4_3'),
    catapult2: img(S + 'tier 2 catapult, larger counterweight trebuchet with iron fittings, isometric siege weapon' + TAIL, 'portrait_4_3'),
    catapult3: img(S + 'tier 3 catapult, massive royal trebuchet with golden accents and reinforced steel, isometric siege weapon' + TAIL, 'portrait_4_3'),
    barracks1: img(S + 'tier 1 barracks, simple wooden training ground with palisade, isometric' + TAIL, 'portrait_4_3'),
    barracks2: img(S + 'tier 2 barracks, larger stone and wood barracks with weapon racks, isometric' + TAIL, 'portrait_4_3'),
    barracks3: img(S + 'tier 3 barracks, grand military compound with golden banner, isometric' + TAIL, 'portrait_4_3'),
  },
  units: {
    soldierShield: img(S + 'Chinese sword and shield soldier, holding dao sword and round shield, cloth armor, side full body, 3D character' + TAIL, 'square'),
    soldierSpear: img(S + 'Chinese spearman, holding long spear with red tassel, leather armor, side full body, 3D character' + TAIL, 'square'),
    soldierArcher: img(S + 'Chinese archer, holding bow, cloth robe, quiver, side full body, 3D character' + TAIL, 'square'),
    soldierBallista: img(S + 'Chinese ballista crew, operating giant crossbow, side full body, 3D character' + TAIL, 'square'),
    soldierCatapult: img(S + 'Chinese catapult crew, operating trebuchet, side full body, 3D character' + TAIL, 'square'),
    soldierCavalry: img(S + 'Chinese heavy cavalry, riding armored horse, holding lance, iron armor, side full body, 3D character' + TAIL, 'square'),
    soldierGuard: img(S + 'Chinese elite imperial guard, dual blades, golden armor with cape, side full body, 3D character' + TAIL, 'square'),
  },
  enemies: {
    bandit: img(S + 'mountain bandit infantry, ragged clothes, wooden club, fierce, side full body, 3D character' + TAIL, 'square'),
    archer: img(S + 'bandit archer, cloth robe, short bow, quiver, cunning, side full body, 3D character' + TAIL, 'square'),
    cavalry: img(S + 'rogue cavalry rider, thin horse, curved saber, leather armor, fierce, side full body, 3D character' + TAIL, 'square'),
    heavy: img(S + 'heavy armored infantry, iron armor, giant axe, muscular, intimidating, side full body, 3D character' + TAIL, 'square'),
    eagle: img(S + 'eagle scout, holding falcon, leather armor and cloak, agile, side full body, 3D character' + TAIL, 'square'),
    siege: img(S + 'siege ram vehicle, wooden wheels and battering ram, crude, side view, 3D' + TAIL, 'square'),
    brute: img(S + 'barbarian brute, bare-chested with tattoos, giant club, wild, side full body, 3D character' + TAIL, 'square'),
    boss: img(S + 'barbarian king, bone crown and armor, double-edged giant axe, menacing, side full body, 3D character' + TAIL, 'square'),
  },
  commander: [
    img(S + 'young border soldier, cloth armor holding dao sword, green and resolute, half body portrait, 3D character' + TAIL, 'portrait_4_3'),
    img(S + 'squad leader officer, leather armor holding sword and small flag, capable, half body portrait, 3D character' + TAIL, 'portrait_4_3'),
    img(S + 'centurion, iron armor on horse with long dao, calm, half body portrait, 3D character' + TAIL, 'portrait_4_3'),
    img(S + 'major officer, mingguang armor with long sword and cape, heroic, half body portrait, 3D character' + TAIL, 'portrait_4_3'),
    img(S + 'commander, silver armor and battle robe with command flag, stern, half body portrait, 3D character' + TAIL, 'portrait_4_3'),
    img(S + 'lieutenant general, golden armor with tiger stripes, cape and heavy dao, dominant, half body portrait, 3D character' + TAIL, 'portrait_4_3'),
    img(S + 'great general, black gold armor with command flag and warhorse, commanding presence, half body portrait, 3D character' + TAIL, 'portrait_4_3'),
    img(S + 'grand marshal, dragon-pattern golden armor and marshal robe with tiger tally, regal, half body portrait, 3D character' + TAIL, 'portrait_4_3'),
  ],
  weapons: {
    dagger: img(S + 'short dao dagger, bronze blade with wooden handle, weapon closeup, 3D' + TAIL, 'square'),
    shield: img(S + 'round shield, wood with iron studs and beast pattern, weapon closeup, 3D' + TAIL, 'square'),
    spear: img(S + 'long spear, red tassel iron spearhead on white wax wood shaft, weapon closeup, 3D' + TAIL, 'square'),
    bow: img(S + 'hunting bow, bamboo wood bow with feathered arrow, weapon closeup, 3D' + TAIL, 'square'),
    ballista: img(S + 'bed crossbow ballista, giant mounted crossbow, weapon closeup, 3D' + TAIL, 'square'),
    catapult: img(S + 'trebuchet catapult, lever throwing machine, weapon closeup, 3D' + TAIL, 'square'),
    ironbow: img(S + 'iron bow, black powerful longbow, weapon closeup, 3D' + TAIL, 'square'),
    repeater: img(S + 'repeating crossbow, wooden multi-shot crossbow, weapon closeup, 3D' + TAIL, 'square'),
    dualblade: img(S + 'dual blades, linked twin short swords, weapon closeup, 3D' + TAIL, 'square'),
  },
} as const

export type AssetKey = keyof typeof ASSETS
