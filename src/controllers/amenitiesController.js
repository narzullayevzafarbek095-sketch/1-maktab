/**
 * ==========================================================================
 * DILBAR EDICATION — AMENITIES & SERVICES CONTROLLER
 * ==========================================================================
 */

const weeklyMenu = {
    mon: {
        dayName: "Dushanba",
        calTotal: "2,150 kkal",
        breakfast: { title: "1-Nonushta (08:30)", desc: "Issiq sutli Shirguruch, sariyog', Golland pishlog'i, kakao", calories: "550 kkal" },
        lunch: { title: "Issiq Tushlik (12:30)", desc: "Qaymoqli tovuq sho'rva, No'xatli go'shtli to'y palovi, yangi pomidor-bodring salati, non", calories: "1,100 kkal" },
        snack: { title: "Ikkinchi Tushlik (16:00)", desc: "Tvorogli shirin sirniklar, yangi olma sharbati va mavsumiy mevalar", calories: "500 kkal" }
    },
    tue: {
        dayName: "Seshanba",
        calTotal: "2,200 kkal",
        breakfast: { title: "1-Nonushta (08:30)", desc: "Sabzavotli mayin omlet, tvorog, yong'oqli tog' asali, limonli choy", calories: "580 kkal" },
        lunch: { title: "Issiq Tushlik (12:30)", desc: "Turkcha Yasmiq sho'rva (Merjimek), Tandirda dimlangan mol go'shti va kartoshka pyure, kompot", calories: "1,120 kkal" },
        snack: { title: "Ikkinchi Tushlik (16:00)", desc: "Banan, vitaminli pechenye, iliq qaynatilgan sut", calories: "500 kkal" }
    },
    wed: {
        dayName: "Chorshanba",
        calTotal: "2,180 kkal",
        breakfast: { title: "1-Nonushta (08:30)", desc: "Suli bo'tqasi (Ovsianka) qulupnay va yong'oqlar bilan, qattiq pishloq, issiq shokolad", calories: "560 kkal" },
        lunch: { title: "Issiq Tushlik (12:30)", desc: "Go'shtli boy Borj, Qovurilgan kurka filesi va grechka, karamli vitamin salati", calories: "1,100 kkal" },
        snack: { title: "Ikkinchi Tushlik (16:00)", desc: "Olmali mayin pirog (Sharlotka), yangi mevali kisel", calories: "520 kkal" }
    },
    thu: {
        dayName: "Payshanba",
        calTotal: "2,240 kkal",
        breakfast: { title: "1-Nonushta (08:30)", desc: "Shirin blinchiklar mevali jem bilan, quritilgan mayiz va yong'oqlar, sutli choy", calories: "590 kkal" },
        lunch: { title: "Issiq Tushlik (12:30)", desc: "Mayda frikadelkali sho'rva, Qozon-kabob mol go'shti va dimlangan sabzavotlar, achchiq-chuchuk", calories: "1,150 kkal" },
        snack: { title: "Ikkinchi Tushlik (16:00)", desc: "Yangi tandirda pishirilgan tovuqli somsa, yalpizli yashil choy", calories: "500 kkal" }
    },
    fri: {
        dayName: "Juma",
        calTotal: "2,120 kkal",
        breakfast: { title: "1-Nonushta (08:30)", desc: "Manniy bo'tqasi sariyog' bilan, qaynatilgan tuxum, pishloq, choy", calories: "540 kkal" },
        lunch: { title: "Issiq Tushlik (12:30)", desc: "Chuchvara sho'rva, Parhez baliq filesi va xushbo'y guruch, zaytunli Grek salati", calories: "1,080 kkal" },
        snack: { title: "Ikkinchi Tushlik (16:00)", desc: "Tvorogli shirin zapekanka, quritilgan mevali kompot", calories: "500 kkal" }
    }
};

const busRoutes = [
    { id: 1, name: "Yunusobod Yo'nalishi", timeMorning: "07:30", timeEvening: "18:15", stops: "Yunusobod 12-mavze ➔ Megaplanet ➔ Shahriston metro ➔ Bodomzor ➔ DILBAR EDICATION", features: ["GPS-monitoring", "Kuzatuvchi tyutor", "Xavfsizlik kamarlari"] },
    { id: 2, name: "Chilonzor Yo'nalishi", timeMorning: "07:25", timeEvening: "18:20", stops: "Chilonzor 20-mavze ➔ Novza metro ➔ Xalqlar Do'stligi ➔ Markaz-1 ➔ DILBAR EDICATION", features: ["GPS-monitoring", "Kuzatuvchi tyutor", "Xavfsizlik kamarlari"] },
    { id: 3, name: "Mirzo Ulug'bek Yo'nalishi", timeMorning: "07:30", timeEvening: "18:15", stops: "TTZ bozori ➔ Buyuk Ipak Yo'li ➔ Oloy bozori ➔ Amir Temur xiyoboni ➔ DILBAR EDICATION", features: ["GPS-monitoring", "Kuzatuvchi tyutor", "Xavfsizlik kamarlari"] },
    { id: 4, name: "Shayxontohur & Sergeli", timeMorning: "07:20", timeEvening: "18:25", stops: "Chorsu bozori ➔ Beruniy ➔ Yakkasaroy ➔ Markaziy Bino ➔ DILBAR EDICATION", features: ["GPS-monitoring", "Kuzatuvchi tyutor", "Xavfsizlik kamarlari"] }
];

const clubsList = [
    { id: 1, name: "Yopiq Suzish Havzasi (Basseyn)", coach: "Olimpiya zaxiralari murabbiyi", time: "16:30 – 17:30", desc: "Haftada 3 marta individual va guruhli suzish mashg'ulotlari." },
    { id: 2, name: "Robototexnika & STEAM IT", coach: "IT Park sertifikatli dasturchi", time: "16:00 – 17:30", desc: "Lego Mindstorms, Arduino va Python dasturlashda robotlar yasash." },
    { id: 3, name: "Shaxmat & Mantiq Akademiyasi", coach: "FIDE xalqaro sport ustasi", time: "16:30 – 17:30", desc: "Strategik fikrlash, taktik hisob-kitoblar va chempionatlar tayyorgarligi." },
    { id: 4, name: "Taekwondo WT & Gimnastika", coach: "Qora belbog' sohibi, oliy toifali murabbiy", time: "16:30 – 17:30", desc: "Qad-qomatni tik tutish, jismoniy chaqqonlik va belbog' sinovlari." },
    { id: 5, name: "Kembrij IELTS & Speaking Club", coach: "CELTA xalqaro mutaxassisi (Native Speaker)", time: "16:00 – 17:00", desc: "Erkin inglizcha muloqot va xalqaro imtihonlarga tayyorgarlik." },
    { id: 6, name: "Tasviriy San'at & Dizayn", coach: "Badiiy akademiya a'zosi", time: "16:30 – 17:30", desc: "Akvarel, moybo'yoq va grafik dizayn asoslari bo'yicha mashg'ulotlar." }
];

exports.getMenu = (req, res) => {
    res.json({ success: true, data: weeklyMenu });
};

exports.getTransport = (req, res) => {
    res.json({ success: true, data: busRoutes });
};

exports.getClubs = (req, res) => {
    res.json({ success: true, data: clubsList });
};

exports.calculateTuition = (req, res) => {
    const { grade = 'middle', plan = 'yearly', bus = 'yes', isFamily = false } = req.body;

    let baseMonthly = 3800000;
    if (grade === 'primary') baseMonthly = 3500000;
    else if (grade === 'high') baseMonthly = 4200000;

    let busMonthly = bus === 'yes' ? 500000 : 0;
    let fullMonthly = baseMonthly + busMonthly;
    let totalYearlyStandard = fullMonthly * 9;

    let discountPercent = 0;
    if (plan === 'semester') discountPercent += 5;
    else if (plan === 'yearly') discountPercent += 10;
    if (isFamily) discountPercent += 15;

    let discountAmount = Math.round(totalYearlyStandard * (discountPercent / 100));
    let finalYearly = totalYearlyStandard - discountAmount;
    let finalMonthly = Math.round(finalYearly / 9);

    res.json({
        success: true,
        calculation: {
            grade,
            plan,
            bus,
            isFamily,
            monthlyPrice: finalMonthly,
            yearlyPrice: finalYearly,
            discountPercent,
            discountAmount,
            included: [
                "08:00 - 18:00 to'liq kunlik ta'lim",
                "3 mahal issiq sog'lom taom",
                "Barcha fan va sport to'garaklari",
                "Uy vazifalarini maktabda bajarish",
                "Doimiy tibbiy va psixologik nazorat"
            ]
        }
    });
};
