import { Collection } from "discord.js";
import { CommandArgs } from "./CommandArgs";

export class CollectionWrapper<K, V> extends Collection<K, V> implements CommandArgs {}