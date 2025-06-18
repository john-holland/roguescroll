import mori from 'mori';

class ListMap {
    constructor() {
        this.map = mori ? (typeof mori.hashMap === 'function' ? mori.hashMap : mori.hash_map)() : {};
    }

    get(key) {
        if (mori) {
            return mori.get(this.map, key);
        }
        return this.map[key];
    }

    has(key) {
        if (mori) {
            return mori.hasKey(this.map, key);
        }
        return key in this.map;
    }

    set(key, value) {
        if (mori) {
            this.map = mori.assoc(this.map, key, value);
        } else {
            this.map[key] = value;
        }
        return this;
    }

    delete(key) {
        if (mori) {
            this.map = mori.dissoc(this.map, key);
        } else {
            delete this.map[key];
        }
        return this;
    }

    clear() {
        if (mori) {
            this.map = mori.hash_map();
        } else {
            this.map = {};
        }
        return this;
    }

    keys() {
        if (mori) {
            return mori.keys(this.map);
        }
        return Object.keys(this.map);
    }

    values() {
        if (mori) {
            return mori.vals(this.map);
        }
        return Object.values(this.map);
    }

    entries() {
        if (mori) {
            return mori.seq(this.map);
        }
        return Object.entries(this.map);
    }
}

export default ListMap;