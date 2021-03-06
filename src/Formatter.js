
import factionConfig from './config/factions.json';
import artifactSetsConfig from './config/artifact_sets.json';

class Formatter {
    constructor() {
        var factionsByKey = {};
        factionConfig.factions.forEach((faction) => {
            factionsByKey[faction.key] = faction;
        });
        var setsByJsonKey = {}
        artifactSetsConfig.sets.forEach((setSpec) => {
            if ('jsonKey' in setSpec) {
                setsByJsonKey[setSpec.jsonKey] = setSpec;
            }
        });
        this.state = {
            factionsByKey: factionsByKey,
            setsByJsonKey: setsByJsonKey
        }
    }

    MoreReadableNumber(num) {
        var suffixes = ["thousand", "million", "billion"];
        var suffix = "";
        for (let i = 0; i < suffixes.length; i++) {
            if (num < 1000) break;
            num /= 1000;
            suffix = suffixes[i];
        }
        return [Math.round(num), suffix];
    }

    SetName(setKey) {
        if (setKey in this.state.setsByJsonKey) {
            return this.state.setsByJsonKey[setKey].label;
        } else {
            return setKey;
        }
    }

    Faction(factionKey) {
        var factionDict = this.state.factionsByKey[factionKey];
        if (!factionDict) {
            return factionKey;
        }
        return <img key={factionKey} src={process.env.PUBLIC_URL + factionDict.icon}
            alt={factionDict.label}
            title={factionDict.label} />;
    }

    FactionLabel(factionKey) {
        var factionDict = this.state.factionsByKey[factionKey];
        if (!factionDict) {
            return factionKey;
        }
        return factionDict.label;
    }

    Attribute(key) {
        var attributeNames = {
            'hp': 'HP',
            'atk': 'ATK',
            'def': 'DEF',
            'CriticalDamage': 'Crit Damage',
            'cd': 'C.DMG',
            'cr': 'C.RATE',
            'CriticalChance': 'Crit Rate',
            'res': 'RES',
            'acc': 'ACC',
            'glyph': ''
        };
        return (key in attributeNames) ? attributeNames[key] : key;

    }

    BonusAmount(isAbsolute, amount) {
        if (isAbsolute) {
            return '+' + amount;
        } else {
            return Math.ceil(amount * 100) + '%';
        }
    }

    // (bonus) is a dict with (kind), (isAbsolute), and (value) keys
    // (rolls) is how many rolls the stat/substat has.
    Bonus(bonus, rolls) {
        if (!bonus || !('value' in bonus) || (bonus.value === 0)) {
            return "";
        }
        var kind = ('kind' in bonus) ? bonus['kind'] : bonus['what'];
        var prefix = this.Attribute(kind);
        if (rolls > 0) {
            prefix += " (" + rolls + ")";
        }
        return prefix + ((prefix && prefix.length > 0) ? ' ' : '')
            + this.BonusAmount(bonus.isAbsolute, bonus.value);
    }

    Rank(rank) {
        if (!rank || (typeof (rank) === "string")) {
            return rank;
        }
        var labels = ["One", "Two", "Three", "Four", "Five", "Six"];
        return (rank > 0 && rank <= labels.length) ? labels[rank - 1] : rank;
    }

    // a Stat
    Stat(stat, rolls) {
        //console.log("stat = " + JSON.stringify(stat));
        var bonus = this.Bonus(stat, rolls)
        if (stat.enhancement > 0) {
            var glyphBonus = {
                kind: 'glyph',
                isAbsolute: stat.isAbsolute,
                value: stat.enhancement
            }
            bonus += " +(" + this.Bonus(glyphBonus, 0) + ")";
        }
        return bonus;

    }

    // an array of substats.
    Substats(subStats) {
        if (!subStats || subStats.length === 0) {
            return null;
        }
        if (subStats.length === 1) {
            return this.Stat(subStats[0], subStats[0].level);
        }
        var entries = [];
        subStats.forEach((subStat, index) => {
            entries.push(<li key={index}>{this.Stat(subStat, subStat.level)}</li>);
        });
        return <ul className="substats">{entries}</ul>;
    }

    // an artifact in short form, for champions page
    ArtifactShort(artifact) {
        if (typeof (artifact) === "string") {
            return artifact;
        }
        return artifact.kind + " "
            + artifact.rank + "*"
            + " (" + artifact.setKind + ")"
            + "," + artifact.level;
    }

    // makes it a litle easier to make an image.
    // you give it:
    // (a) the src attribute - required. Local
    // (b) the alt/label attribute - uses same for both
    // (c) any additional attributes in a hash
    Image(src, label, additional) {
        if (!additional) {
            additional = {};
        }
        return (
            <img src={process.env.PUBLIC_URL + src} title={label} alt={label} {...additional} />
        );
    }

    Skills(skillsArray) {
        var elements = [];
        skillsArray.forEach((skill) => {
            var ofPart = skill.maxLevel > 0 ? ("/" + skill.maxLevel) : "";
            elements.push(<li key={skill.id}><span class="skill_name">{skill.name}</span>, level {skill.level}{ofPart}</li>);
        })
        return (<ul className="skills_list">{elements}</ul>);
    }
}

export default Formatter;
