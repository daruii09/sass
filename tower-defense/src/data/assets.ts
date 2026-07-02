// 美术素材：通过 AI 图像生成 API 生成，运行时由浏览器加载（携带用户会话鉴权）
// 不使用代码绘制，全部为真实生成的图片

const API = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image'

function img(prompt: string, size: string): string {
  return `${API}?prompt=${encodeURIComponent(prompt)}&image_size=${size}`
}

// 统一风格前缀
const S = '中国古代水墨重彩国风游戏美术，'
const TAIL = '，高清细节，无文字水印，正面构图'

export const ASSETS = {
  bg: {
    grassland: img(S + '草原战场全景，远处青山连绵营帐旌旗飘扬，前景泥土路蜿蜒，黄昏暖光' + TAIL, 'landscape_16_9'),
    desert: img(S + '戈壁沙漠战场，黄沙漫天烽火台矗立，远处雪山，残阳如血' + TAIL, 'landscape_16_9'),
    snow: img(S + '雪山关隘战场，冰封城墙蜿蜒，松林覆雪，寒风凛冽' + TAIL, 'landscape_16_9'),
    river: img(S + '江南水乡战场，河道纵横柳树依依，小桥乌篷船，薄雾' + TAIL, 'landscape_16_9'),
    capital: img(S + '帝都皇城战场，宏伟宫阙琉璃瓦，城墙巍峨，火光冲天' + TAIL, 'landscape_16_9'),
    hall: img(S + '古代帅帐内部，虎符令旗沙盘地图案卷，烛火摇曳，肃穆' + TAIL, 'landscape_16_9'),
    splash: img(S + '战场黄昏史诗场景，残阳烽火狼烟，千军万马剪影，浓墨重彩' + TAIL, 'landscape_16_9'),
  },
  buildings: {
    castlePlayer: img(S + '中国古代城关要塞，青砖城楼箭垛城门，侧面俯视，独立建筑' + TAIL, 'portrait_4_3'),
    castleEnemy: img(S + '敌方蛮族营寨，木栅栏瞭望塔兽骨旗帜，破败粗犷' + TAIL, 'portrait_4_3'),
    barracks: img(S + '中国古代兵营帐篷，木质框架稻草顶，侧面，营地建筑' + TAIL, 'portrait_4_3'),
  },
  path: {
    dirt: img(S + '单格泥土路纹理俯视，黄褐色车辙脚印青草边缘，无缝拼接 tile' + TAIL, 'square'),
  },
  towers: {
    archer: img(S + '中国古代弓箭手塔楼，木质高台瞭望箭窗旌旗，侧面，防御塔' + TAIL, 'portrait_4_3'),
    ballista: img(S + '中国古代床弩炮台，巨型十字弩机木架轮子，侧面，攻城器械' + TAIL, 'portrait_4_3'),
    catapult: img(S + '中国古代投石车，杠杆抛石机械木架配重，侧面，攻城器械' + TAIL, 'portrait_4_3'),
    barracks: img(S + '中国古代近战兵营训练场，木质栅栏兵器架，侧面，营地' + TAIL, 'portrait_4_3'),
  },
  units: {
    soldierShield: img(S + '中国古代刀盾兵，持短刀圆盾布甲，侧面全身，Q版写实' + TAIL, 'square'),
    soldierSpear: img(S + '中国古代长枪兵，持长枪红缨皮甲，侧面全身，Q版写实' + TAIL, 'square'),
    soldierArcher: img(S + '中国古代弓箭手，持弓布衣箭袋，侧面全身，Q版写实' + TAIL, 'square'),
    soldierBallista: img(S + '中国古代床弩手，操作巨型弩机，侧面全身，Q版写实' + TAIL, 'square'),
    soldierCatapult: img(S + '中国古代投石车兵，操作抛石机械，侧面全身，Q版写实' + TAIL, 'square'),
    soldierCavalry: img(S + '中国古代重装骑兵，骑马持枪铁甲，侧面全身，Q版写实' + TAIL, 'square'),
    soldierGuard: img(S + '中国古代精锐禁卫，持双刀金甲披风，侧面全身，Q版写实' + TAIL, 'square'),
  },
  enemies: {
    bandit: img(S + '山贼步兵，破衣烂衫持木棍，凶恶，侧面全身，Q版写实' + TAIL, 'square'),
    archer: img(S + '山贼弓手，布衣短弓箭袋，狡诈，侧面全身，Q版写实' + TAIL, 'square'),
    cavalry: img(S + '流寇骑兵，瘦马弯刀皮甲，彪悍，侧面全身，Q版写实' + TAIL, 'square'),
    heavy: img(S + '重甲步兵，铁甲巨斧壮汉，威慑，侧面全身，Q版写实' + TAIL, 'square'),
    eagle: img(S + '飞鹰斥候，持鹰侦察兵皮甲斗篷，敏捷，侧面全身，Q版写实' + TAIL, 'square'),
    siege: img(S + '攻城车，木轮撞锤机械，粗笨，侧面，Q版写实' + TAIL, 'square'),
    brute: img(S + '蛮族勇士，赤膊纹身持巨棒，狂野，侧面全身，Q版写实' + TAIL, 'square'),
    boss: img(S + '蛮王，兽骨冠甲持双刃巨斧，威严恐怖，侧面全身，Q版写实' + TAIL, 'square'),
  },
  commander: [
    img(S + '年轻边防小兵，布甲持短刀，青涩坚毅，半身立绘' + TAIL, 'portrait_4_3'),
    img(S + '什长军官，皮甲持刀小旗，干练，半身立绘' + TAIL, 'portrait_4_3'),
    img(S + '百夫长，铁甲战马长刀，沉稳，半身立绘' + TAIL, 'portrait_4_3'),
    img(S + '校尉将军，明光甲长剑披风，英武，半身立绘' + TAIL, 'portrait_4_3'),
    img(S + '都尉大将，银甲战袍令旗，威严，半身立绘' + TAIL, 'portrait_4_3'),
    img(S + '偏将军，金甲虎纹披风大刀，霸者之气，半身立绘' + TAIL, 'portrait_4_3'),
    img(S + '大将，黑金甲令旗战马，统帅之威，半身立绘' + TAIL, 'portrait_4_3'),
    img(S + '兵马大元帅，龙纹金甲帅袍虎符，王者风范，半身立绘' + TAIL, 'portrait_4_3'),
  ],
  weapons: {
    dagger: img(S + '短刀，青铜刃木柄，兵器特写' + TAIL, 'square'),
    shield: img(S + '圆盾，木质铁钉兽纹，兵器特写' + TAIL, 'square'),
    spear: img(S + '长枪，红缨铁枪头白蜡杆，兵器特写' + TAIL, 'square'),
    bow: img(S + '猎弓，竹木弓羽箭，兵器特写' + TAIL, 'square'),
    ballista: img(S + '床弩，巨型十字弩机，兵器特写' + TAIL, 'square'),
    catapult: img(S + '投石车，杠杆抛石机械，兵器特写' + TAIL, 'square'),
    ironbow: img(S + '铁胎弓，黑色强力长弓，兵器特写' + TAIL, 'square'),
    repeater: img(S + '诸葛连弩，木质连发弩机，兵器特写' + TAIL, 'square'),
    dualblade: img(S + '双刀，连环双刃短刀，兵器特写' + TAIL, 'square'),
  },
} as const

export type AssetKey = keyof typeof ASSETS
