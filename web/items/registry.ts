// Every item in the room. Add a folder under items/ and list it here.
import type { ItemDef } from "./types";
import bed from "./bed/item";
import laptop from "./laptop/item";
import phone from "./phone/item";
import controller from "./controller/item";
import nightstand from "./nightstand/item";
import lamp from "./lamp/item";
import desk from "./desk/item";
import monitor from "./monitor/item";
import keyboard from "./keyboard/item";
import speakers from "./speakers/item";
import headset from "./headset/item";
import drinks from "./drinks/item";
import pc from "./pc/item";
import bin from "./bin/item";
import chair from "./chair/item";
import cabinet from "./cabinet/item";
import window from "./window/item";
import windowCovering from "./window-covering/item";
import door from "./door/item";
import closet from "./closet/item";
import lightSwitch from "./switch/item";
import socket from "./socket/item";
import wall_shelf from "./wall-shelf/item";
import poster from "./poster/item";
import rug from "./rug/item";
import neon_cove from "./neon-cove/item";
import ceiling_light from "./ceiling-light/item";
import smoke_detector from "./smoke-detector/item";
import hoodie from "./hoodie/item";
import jeans from "./jeans/item";
import sneakers from "./sneakers/item";
import basketball from "./basketball/item";
import skateboard from "./skateboard/item";

export const ITEMS: Record<string, ItemDef> = Object.fromEntries(
  ([] as ItemDef[]).concat(
    bed,
    laptop,
    phone,
    controller,
    nightstand,
    lamp,
    desk,
    monitor,
    keyboard,
    speakers,
    headset,
    drinks,
    pc,
    bin,
    chair,
    cabinet,
    window,
    windowCovering,
    door,
    closet,
    lightSwitch,
    socket,
    wall_shelf,
    poster,
    rug,
    neon_cove,
    ceiling_light,
    smoke_detector,
    hoodie,
    jeans,
    sneakers,
    basketball,
    skateboard,
  ).map((d) => [d.id, d]),
);
