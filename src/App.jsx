import { useState, useMemo, useCallback } from "react";

const SPEND_TIERS = [
  { label: "$1,500+",   min: 1500, max: Infinity, color: "#16a34a", bg: "#dcfce7", dot: "#16a34a" },
  { label: "$750–1,500",min: 750,  max: 1499,     color: "#0891b2", bg: "#cffafe", dot: "#0891b2" },
  { label: "$500–750",  min: 500,  max: 749,       color: "#d97706", bg: "#fef3c7", dot: "#d97706" },
  { label: "$250–500",  min: 250,  max: 499,       color: "#ea580c", bg: "#ffedd5", dot: "#ea580c" },
  { label: "<$250",     min: 1,    max: 249,        color: "#dc2626", bg: "#fee2e2", dot: "#dc2626" },
  { label: "Prospect",  min: 0,    max: 0,          color: "#6b7280", bg: "#f3f4f6", dot: "#9ca3af" },
];
function getSpendTier(spend) {
  const n = parseFloat(spend) || 0;
  if (n === 0) return SPEND_TIERS[5];
  return SPEND_TIERS.find(t => n >= t.min && n <= t.max) || SPEND_TIERS[5];
}

const INITIAL_CUSTOMERS = [
  // ── PILOT POINT ──────────────────────────────────────────────────────────
  { id:1,   name:"JB's Auto Repair",                  type:"Auto Repair",        town:"Pilot Point",  address:"615 S Massey St",          fullAddress:"615 S Massey St, Pilot Point, TX 76258",             phone:"940-273-3323",   contact:"James",         email:"", rating:"",    reviews:0,   priority:"High",   status:"Customer",  acctNum:"1",     monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                          relScore:"", isStocking:false, inventory:[] },
  { id:2,   name:"Al's Qwik E Lube",                  type:"Quick Lube",         town:"Pilot Point",  address:"1117 US-377",               fullAddress:"1117 US-377, Pilot Point, TX 76258",                 phone:"(940) 686-5823", contact:"",              email:"", rating:"4.5", reviews:94,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Bulk oil / recurring",                      relScore:"", isStocking:false, inventory:[] },
  { id:3,   name:"Bryant's Tire Shop",                type:"Tire Shop",          town:"Pilot Point",  address:"400 US-377",                fullAddress:"400 US-377, Pilot Point, TX 76258",                  phone:"940-286-8473",   contact:"",              email:"", rating:"4.6", reviews:164, priority:"High",   status:"Customer",  acctNum:"288",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Used tires",                                relScore:"", isStocking:false, inventory:[] },
  { id:4,   name:"Key Auto Repairs",                  type:"Auto Repair",        town:"Pilot Point",  address:"608 N Washington St",       fullAddress:"608 N Washington St, Pilot Point, TX 76258",         phone:"940-218-5439",   contact:"Steven",        email:"", rating:"4.9", reviews:41,  priority:"High",   status:"Customer",  acctNum:"235",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"General repairs",                           relScore:"", isStocking:false, inventory:[] },
  { id:5,   name:"Caliber Collision",                 type:"Auto Body",          town:"Pilot Point",  address:"8600 US-377",               fullAddress:"8600 US-377, Pilot Point, TX 76258",                 phone:"(940) 290-0305", contact:"",              email:"", rating:"4.9", reviews:79,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Collision / body",                          relScore:"", isStocking:false, inventory:[] },
  { id:6,   name:"Mark's Body Shop",                  type:"Auto Body",          town:"Pilot Point",  address:"1112 US-377",               fullAddress:"1112 US-377, Pilot Point, TX 76258",                 phone:"940-686-5194",   contact:"Mark",          email:"", rating:"4.9", reviews:40,  priority:"High",   status:"Customer",  acctNum:"1350",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Body shop",                                 relScore:"", isStocking:false, inventory:[] },
  { id:7,   name:"Speed Shop Garage",                 type:"Restoration",        town:"Pilot Point",  address:"1145 Jc Ln",                fullAddress:"1145 Jc Ln, Pilot Point, TX 76258",                  phone:"(469) 756-9065", contact:"",              email:"", rating:"5.0", reviews:1,   priority:"Medium", status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Classic restoration",                       relScore:"", isStocking:false, inventory:[] },
  { id:8,   name:"R&M Garage LLC",                    type:"Auto Repair",        town:"Pilot Point",  address:"10221 FM 455 E",            fullAddress:"10221 FM 455 E, Pilot Point, TX 76258",              phone:"214-354-3353",   contact:"Brian",         email:"", rating:"4.9", reviews:39,  priority:"High",   status:"Customer",  acctNum:"1851",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Full service",                              relScore:"", isStocking:false, inventory:[] },
  { id:9,   name:"All American Towing",               type:"Towing",             town:"Pilot Point",  address:"561 E Blackjack Rd",        fullAddress:"561 E Blackjack Rd, Pilot Point, TX 76258",          phone:"(940) 627-2800", contact:"",              email:"", rating:"4.2", reviews:82,  priority:"Medium", status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Fleet / towing",                            relScore:"", isStocking:false, inventory:[] },
  { id:10,  name:"Dan's Equipment Sales",             type:"Tractor Dealer",     town:"Pilot Point",  address:"1212 S Washington St",      fullAddress:"1212 S Washington St, Pilot Point, TX 76258",        phone:"940-206-2809",   contact:"Dan",           email:"", rating:"4.3", reviews:27,  priority:"High",   status:"Customer",  acctNum:"1440",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Equipment / tractor sales",                 relScore:"", isStocking:false, inventory:[] },
  { id:11,  name:"Big Brand Tire & Service (PP)",     type:"Tire Shop",          town:"Pilot Point",  address:"1321 N Hwy 377",            fullAddress:"1321 N Hwy 377, Pilot Point, TX 76258",              phone:"940-686-8473",   contact:"John",          email:"", rating:"4.7", reviews:573, priority:"High",   status:"Customer",  acctNum:"4017",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Stocking: filters & batteries",             relScore:"", isStocking:true,  inventory:[{id:"bb-pp-1",partNum:"21348",description:"Oil Filter",parLevel:12,currentStock:0},{id:"bb-pp-2",partNum:"78-8C",description:"Battery Grp 78",parLevel:4,currentStock:0}] },
  { id:12,  name:"Luna's Mod Shop",                   type:"Mechanic",           town:"Pilot Point",  address:"703 Brenda's Way",          fullAddress:"703 Brenda's Way, Pilot Point, TX 76258",            phone:"214-500-7137",   contact:"Alex",          email:"", rating:"5.0", reviews:42,  priority:"High",   status:"Customer",  acctNum:"201",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"General mechanic",                          relScore:"", isStocking:false, inventory:[] },
  { id:13,  name:"Sanchez Tire Shop",                 type:"Tire Shop",          town:"Pilot Point",  address:"208 W Walcott St",          fullAddress:"208 W Walcott St, Pilot Point, TX 76258",            phone:"940-300-7209",   contact:"Sanchez",       email:"", rating:"4.4", reviews:28,  priority:"High",   status:"Customer",  acctNum:"39",    monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Tire service",                              relScore:"", isStocking:false, inventory:[] },
  { id:14,  name:"JJRush Performance & Automotive",   type:"Auto Repair",        town:"Pilot Point",  address:"303 W Walcott St",          fullAddress:"303 W Walcott St, Pilot Point, TX 76258",            phone:"940-686-6860",   contact:"JJ",            email:"", rating:"4.2", reviews:137, priority:"High",   status:"Customer",  acctNum:"17",    monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Performance automotive",                    relScore:"", isStocking:false, inventory:[] },
  { id:15,  name:"Platinum Ford North (Parts)",       type:"Auto Parts Store",   town:"Pilot Point",  address:"11590 S Hwy 377",           fullAddress:"11590 S Hwy 377, Pilot Point, TX 76258",             phone:"940-686-2236",   contact:"Jack",          email:"", rating:"5.0", reviews:4,   priority:"High",   status:"Customer",  acctNum:"1410",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Dealership parts department",               relScore:"", isStocking:false, inventory:[] },
  { id:16,  name:"Paschal Performance",               type:"Auto Repair",        town:"Pilot Point",  address:"930 N Hwy 377",             fullAddress:"930 N Hwy 377, Pilot Point, TX 76258",               phone:"817-578-5308",   contact:"",              email:"", rating:"",    reviews:0,   priority:"Medium", status:"Customer",  acctNum:"231",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                          relScore:"", isStocking:false, inventory:[] },
  { id:17,  name:"Outback Garage",                    type:"Auto Repair",        town:"Pilot Point",  address:"1321 N Saint James Rd",     fullAddress:"1321 N Saint James Rd, Pilot Point, TX 76258",       phone:"940-300-1149",   contact:"",              email:"", rating:"",    reviews:0,   priority:"Medium", status:"Customer",  acctNum:"819",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                          relScore:"", isStocking:false, inventory:[] },
  { id:18,  name:"TNJ's Automotive",                  type:"Auto Repair",        town:"Pilot Point",  address:"700 N Jefferson St",        fullAddress:"700 N Jefferson St, Pilot Point, TX 76258",          phone:"940-442-3811",   contact:"Tony",          email:"", rating:"",    reviews:0,   priority:"High",   status:"Customer",  acctNum:"186",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                          relScore:"", isStocking:false, inventory:[] },
  { id:19,  name:"North TX Precision Machining",      type:"Machine Shop",       town:"Pilot Point",  address:"1216 N Hwy 377",            fullAddress:"1216 N Hwy 377, Pilot Point, TX 76258",              phone:"940-686-2326",   contact:"",              email:"", rating:"",    reviews:0,   priority:"Medium", status:"Customer",  acctNum:"145",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                          relScore:"", isStocking:false, inventory:[] },
  { id:20,  name:"Staley Steel",                      type:"Steel Fabrication",  town:"Pilot Point",  address:"9620 St John Rd",           fullAddress:"9620 St John Rd, Pilot Point, TX 76258",             phone:"940-686-6000",   contact:"Dale",          email:"", rating:"",    reviews:0,   priority:"High",   status:"Customer",  acctNum:"3200",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                          relScore:"", isStocking:false, inventory:[] },
  { id:21,  name:"Ardon Brothers Tire Shop",          type:"Tire Shop",          town:"Pilot Point",  address:"1293 US-377",               fullAddress:"1293 US-377, Pilot Point, TX 76258",                 phone:"(214) 586-4009", contact:"",              email:"", rating:"5.0", reviews:2,   priority:"Medium", status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Tire and repair",                           relScore:"", isStocking:false, inventory:[] },
  // ── SANGER ───────────────────────────────────────────────────────────────
  { id:30,  name:"Cummins Auto",                      type:"Auto Repair",        town:"Sanger",       address:"1220 FM 455 W Unit E1",     fullAddress:"1220 FM 455 W, Sanger, TX 76266",                    phone:"(940) 735-6752", contact:"",              email:"", rating:"4.5", reviews:46,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"General repair",                            relScore:"", isStocking:false, inventory:[] },
  { id:31,  name:"After Hours Motorsports",           type:"Jeep / Off-Road",    town:"Sanger",       address:"8307 FM 2164 Bldg 6",       fullAddress:"8307 FM 2164, Sanger, TX 76266",                     phone:"(940) 735-3500", contact:"",              email:"", rating:"4.9", reviews:53,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Jeep specialist",                           relScore:"", isStocking:false, inventory:[] },
  { id:32,  name:"Randy's of Sanger",                 type:"Auto Repair",        town:"Sanger",       address:"203 W Chapman Dr",          fullAddress:"203 W Chapman Dr, Sanger, TX 76266",                 phone:"(940) 535-4045", contact:"",              email:"", rating:"4.5", reviews:76,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Multi-service",                             relScore:"", isStocking:false, inventory:[] },
  { id:33,  name:"Family First Automotive",           type:"Auto Repair",        town:"Sanger",       address:"300 N Stemmons St",         fullAddress:"300 N Stemmons St, Sanger, TX 76266",                phone:"(940) 458-8519", contact:"",              email:"", rating:"4.7", reviews:120, priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"General repair",                            relScore:"", isStocking:false, inventory:[] },
  { id:34,  name:"Marvin's Auto Repair",              type:"Auto Repair",        town:"Sanger",       address:"209 E Chapman Dr",          fullAddress:"209 E Chapman Dr, Sanger, TX 76266",                 phone:"(940) 458-5211", contact:"",              email:"", rating:"4.9", reviews:41,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"General automotive",                        relScore:"", isStocking:false, inventory:[] },
  { id:35,  name:"City of Sanger",                    type:"Municipal Fleet",    town:"Sanger",       address:"100 Cherry St",             fullAddress:"100 Cherry St, Sanger, TX 76266",                    phone:"940-458-4721",   contact:"",              email:"", rating:"",    reviews:0,   priority:"High",   status:"Customer",  acctNum:"97",    monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Municipal fleet",                           relScore:"", isStocking:false, inventory:[] },
  { id:36,  name:"Renewal Contractors",               type:"Construction",       town:"Sanger",       address:"7139 Odum Rd",              fullAddress:"7139 Odum Rd, Sanger, TX 76266",                     phone:"972-523-4414",   contact:"",              email:"", rating:"",    reviews:0,   priority:"Medium", status:"Customer",  acctNum:"430",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                          relScore:"", isStocking:false, inventory:[] },
  { id:37,  name:"Bonet Transmission & Auto Repair",  type:"Transmission Shop",  town:"Sanger",       address:"1252 FM 455 W",             fullAddress:"1252 FM 455 W, Sanger, TX 76266",                    phone:"(940) 395-5231", contact:"",              email:"", rating:"5.0", reviews:3,   priority:"Medium", status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Transmission specialist",                   relScore:"", isStocking:false, inventory:[] },
  // ── CROSS ROADS ──────────────────────────────────────────────────────────
  { id:40,  name:"Fifth Gear Automotive",             type:"Auto Repair",        town:"Cross Roads",  address:"7351 US-377",               fullAddress:"7351 US-377, Cross Roads, TX 76227",                 phone:"817-540-7500",   contact:"Calvin",        email:"", rating:"4.9", reviews:668, priority:"High",   status:"Customer",  acctNum:"258",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Highest volume. Rotors for police, Mobil 1 ULV trans fluid.", relScore:"", isStocking:false, inventory:[] },
  { id:41,  name:"Big Brand Tire & Service (CR)",     type:"Tire Shop",          town:"Cross Roads",  address:"100 Naylor Rd",             fullAddress:"100 Naylor Rd, Cross Roads, TX 76227",               phone:"940-240-6828",   contact:"Brian",         email:"", rating:"4.6", reviews:600, priority:"High",   status:"Customer",  acctNum:"4014",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Stocking: filters & batteries",             relScore:"", isStocking:true,  inventory:[{id:"bb-cr-1",partNum:"21348",description:"Oil Filter",parLevel:12,currentStock:0},{id:"bb-cr-2",partNum:"78-8C",description:"Battery Grp 78",parLevel:4,currentStock:0}] },
  // ── AUBREY ───────────────────────────────────────────────────────────────
  { id:50,  name:"Providence Automotive",             type:"Auto Repair",        town:"Aubrey",       address:"2761 FM 2931",              fullAddress:"2761 FM 2931, Aubrey, TX 76227",                     phone:"940-365-9410",   contact:"Mike/Andrew",   email:"", rating:"4.9", reviews:537, priority:"High",   status:"Customer",  acctNum:"50088", monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Large shop",                                relScore:"", isStocking:false, inventory:[] },
  { id:51,  name:"Aubrey Automotive Repair Center",   type:"Auto Repair",        town:"Aubrey",       address:"800 US-377",                fullAddress:"800 US-377, Aubrey, TX 76227",                       phone:"(940) 365-1002", contact:"",              email:"", rating:"4.8", reviews:160, priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Strong reviews",                            relScore:"", isStocking:false, inventory:[] },
  { id:52,  name:"Ultimate Auto Repair",              type:"Auto Repair",        town:"Aubrey",       address:"700 US-377",                fullAddress:"700 US-377, Aubrey, TX 76227",                       phone:"(940) 365-9997", contact:"",              email:"", rating:"4.5", reviews:111, priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Busy general",                              relScore:"", isStocking:false, inventory:[] },
  { id:53,  name:"Superhero Automotive Repairs",      type:"Auto Repair",        town:"Aubrey",       address:"9053 Ike Byrom Rd",         fullAddress:"9053 Ike Byrom Rd, Aubrey, TX 76227",                phone:"(940) 945-7987", contact:"",              email:"", rating:"4.9", reviews:48,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Excellent reviews",                         relScore:"", isStocking:false, inventory:[] },
  { id:54,  name:"GTG RV Repair & Rentals",           type:"RV Repair",          town:"Aubrey",       address:"4320 US-377",               fullAddress:"4320 US-377, Aubrey, TX 76227",                      phone:"940-334-7471",   contact:"Kristi",        email:"", rating:"4.8", reviews:66,  priority:"High",   status:"Customer",  acctNum:"245",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Great relationship — call us first.",       relScore:"", isStocking:false, inventory:[] },
  { id:55,  name:"AntiMatter Performance",            type:"Performance",        town:"Aubrey",       address:"2601 Wheeler Ave",          fullAddress:"2601 Wheeler Ave, Aubrey, TX 76227",                 phone:"(972) 342-8871", contact:"",              email:"", rating:"5.0", reviews:87,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Performance",                               relScore:"", isStocking:false, inventory:[] },
  { id:56,  name:"Stett's Diesel Trucks",             type:"Diesel Truck",       town:"Aubrey",       address:"2160 Rockhill Rd",          fullAddress:"2160 Rockhill Rd, Aubrey, TX 76227",                 phone:"(972) 423-3310", contact:"",              email:"", rating:"5.0", reviews:45,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Diesel trucks",                             relScore:"", isStocking:false, inventory:[] },
  { id:57,  name:"428Auto",                           type:"Auto Repair",        town:"Aubrey",       address:"110 N Sherman Dr",          fullAddress:"110 N Sherman Dr, Aubrey, TX 76227",                 phone:"469-779-5195",   contact:"",              email:"", rating:"4.1", reviews:14,  priority:"Medium", status:"Customer",  acctNum:"278",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Smaller shop",                              relScore:"", isStocking:false, inventory:[] },
  { id:58,  name:"DFW Luxury Automotive Group",       type:"Auto Repair",        town:"Aubrey",       address:"1518 Navo Rd Suite B-01",   fullAddress:"1518 Navo Rd, Aubrey, TX 76227",                     phone:"(214) 404-2881", contact:"",              email:"", rating:"4.9", reviews:163, priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Luxury automotive",                         relScore:"", isStocking:false, inventory:[] },
  { id:59,  name:"Brad's Automotive (Aubrey)",        type:"Auto Repair",        town:"Aubrey",       address:"210 S Hwy 377",             fullAddress:"210 S Hwy 377, Aubrey, TX 76227",                    phone:"940-365-9006",   contact:"Brad",          email:"", rating:"4.9", reviews:44,  priority:"High",   status:"Customer",  acctNum:"273",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"General repair",                            relScore:"", isStocking:false, inventory:[] },
  { id:60,  name:"Frank Bartel Transportation",       type:"Trucking",           town:"Aubrey",       address:"7401 US-377",               fullAddress:"7401 US-377, Aubrey, TX 76227",                      phone:"940-440-3230",   contact:"Miguel",        email:"", rating:"4.5", reviews:22,  priority:"High",   status:"Customer",  acctNum:"1635",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Heavy trucking / construction. Stocking.",  relScore:"", isStocking:true,  inventory:[{id:"fbt-1",partNum:"21348",description:"Oil Filter",parLevel:6,currentStock:0},{id:"fbt-2",partNum:"LF-9080",description:"HD Oil Filter",parLevel:4,currentStock:0}] },
  { id:61,  name:"Moss Performance",                  type:"ATV Repair",         town:"Aubrey",       address:"2576 FM 455",               fullAddress:"2576 FM 455, Aubrey, TX 76227",                      phone:"702-441-5851",   contact:"",              email:"", rating:"4.4", reviews:55,  priority:"Medium", status:"Customer",  acctNum:"246",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"ATV / powersports",                         relScore:"", isStocking:false, inventory:[] },
  { id:62,  name:"Big Brand Tire & Service (SAV)",    type:"Tire Shop",          town:"Aubrey",       address:"26779 US-380",              fullAddress:"26779 US-380, Aubrey, TX 76227",                     phone:"469-715-0028",   contact:"Danny",         email:"", rating:"4.6", reviews:600, priority:"High",   status:"Customer",  acctNum:"4015",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Stocking: filters & batteries",             relScore:"", isStocking:true,  inventory:[{id:"bb-sav-1",partNum:"21348",description:"Oil Filter",parLevel:12,currentStock:0},{id:"bb-sav-2",partNum:"78-8C",description:"Battery Grp 78",parLevel:4,currentStock:0}] },
  { id:63,  name:"RTEL Construction",                 type:"Construction",       town:"Aubrey",       address:"8291 FM 2931",              fullAddress:"8291 FM 2931, Aubrey, TX 76227",                     phone:"940-365-0895",   contact:"",              email:"", rating:"",    reviews:0,   priority:"Medium", status:"Customer",  acctNum:"159",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                          relScore:"", isStocking:false, inventory:[] },
  { id:64,  name:"BSP Motorsports LLC",               type:"Performance",        town:"Aubrey",       address:"14546 Industrial Park",     fullAddress:"14546 Industrial Park, Aubrey, TX 76227",            phone:"(469) 731-5887", contact:"",              email:"", rating:"4.9", reviews:208, priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Performance",                               relScore:"", isStocking:false, inventory:[] },
  // ── CELINA ───────────────────────────────────────────────────────────────
  { id:70,  name:"Xclusive Truck Kustoms",            type:"Truck Accessories",  town:"Celina",       address:"200 S Louisiana Dr #120",   fullAddress:"200 S Louisiana Dr, Celina, TX 75009",              phone:"(214) 687-2703", contact:"",              email:"", rating:"4.7", reviews:171, priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Truck custom",                              relScore:"", isStocking:false, inventory:[] },
  { id:71,  name:"Celina Diesel",                     type:"Diesel Repair",      town:"Celina",       address:"11187 Co Rd 95",            fullAddress:"11187 Co Rd 95, Celina, TX 75009",                  phone:"(469) 502-3550", contact:"",              email:"", rating:"5.0", reviews:22,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Diesel specialist",                         relScore:"", isStocking:false, inventory:[] },
  { id:72,  name:"RX Collision Celina",               type:"Auto Body",          town:"Celina",       address:"112 W Ash St",              fullAddress:"112 W Ash St, Celina, TX 75009",                    phone:"(972) 382-3040", contact:"",              email:"", rating:"4.9", reviews:40,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Collision",                                 relScore:"", isStocking:false, inventory:[] },
  { id:73,  name:"D & V Auto Repair",                 type:"Auto Repair",        town:"Celina",       address:"106 N Louisiana Dr",        fullAddress:"106 N Louisiana Dr, Celina, TX 75009",              phone:"972-382-3601",   contact:"",              email:"", rating:"4.5", reviews:156, priority:"Medium", status:"Customer",  acctNum:"1620",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"General",                                   relScore:"", isStocking:false, inventory:[] },
  { id:74,  name:"FCS Construction LLC",              type:"Construction Fleet", town:"Celina",       address:"1490 N Louisiana Dr",       fullAddress:"1490 N Louisiana Dr, Celina, TX 75009",             phone:"214-551-2348",   contact:"Sean/Barry",    email:"", rating:"4.6", reviews:8,   priority:"High",   status:"Customer",  acctNum:"2800",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Construction fleet",                        relScore:"", isStocking:false, inventory:[] },
  { id:75,  name:"Dickerson Construction Co",         type:"Construction Fleet", town:"Celina",       address:"1130 N Louisiana Dr",       fullAddress:"1130 N Louisiana Dr, Celina, TX 75009",             phone:"972-382-2123",   contact:"Devin/Blake",   email:"", rating:"3.3", reviews:6,   priority:"Medium", status:"Customer",  acctNum:"28",    monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Will call if they need anything.",          relScore:"", isStocking:false, inventory:[] },
  { id:76,  name:"1876 Country Club",                 type:"Golf / Fleet",       town:"Celina",       address:"3500 N Legacy Dr",          fullAddress:"3500 N Legacy Dr, Celina, TX 75009",                phone:"214-497-1097",   contact:"",              email:"", rating:"",    reviews:0,   priority:"Medium", status:"Customer",  acctNum:"287",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                          relScore:"", isStocking:false, inventory:[] },
  // ── GUNTER ───────────────────────────────────────────────────────────────
  { id:80,  name:"Hickman Creations",                 type:"Auto Restoration",   town:"Gunter",       address:"424 W Main St",             fullAddress:"424 W Main St, Gunter, TX 75058",                   phone:"(903) 228-5014", contact:"",              email:"", rating:"4.0", reviews:21,  priority:"Medium", status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Classic cars",                              relScore:"", isStocking:false, inventory:[] },
  { id:81,  name:"Rushton Automotive",                type:"Auto Repair",        town:"Gunter",       address:"424 W Main St Suite 6",     fullAddress:"424 W Main St, Gunter, TX 75058",                   phone:"(972) 433-3972", contact:"",              email:"", rating:"5.0", reviews:10,  priority:"Medium", status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Small repair",                              relScore:"", isStocking:false, inventory:[] },
  { id:82,  name:"Mario Jr Tire Service",             type:"Tire Shop",          town:"Gunter",       address:"341 Stiff Chapel Rd",       fullAddress:"341 Stiff Chapel Rd, Gunter, TX 75058",             phone:"903-816-1459",   contact:"Mario",         email:"", rating:"",    reviews:0,   priority:"High",   status:"Customer",  acctNum:"64",    monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                          relScore:"", isStocking:false, inventory:[] },
  // ── COLLINSVILLE ─────────────────────────────────────────────────────────
  { id:90,  name:"Three Seventy Seven Tires",         type:"Tire & Oil",         town:"Collinsville", address:"719 US-377",                fullAddress:"719 US-377, Collinsville, TX 76233",                 phone:"(903) 429-3425", contact:"",              email:"", rating:"4.6", reviews:66,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Tires + oil",                               relScore:"", isStocking:false, inventory:[] },
  { id:91,  name:"Collinsville Tire Shop",            type:"Tire Shop",          town:"Collinsville", address:"9415 US-377",               fullAddress:"9415 US-377, Collinsville, TX 76233",                phone:"(214) 549-7306", contact:"",              email:"", rating:"5.0", reviews:72,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Tire shop",                                 relScore:"", isStocking:false, inventory:[] },
  { id:92,  name:"Brad's Automotive (Collinsville)",  type:"Auto Repair",        town:"Collinsville", address:"2118 Dawkins Rd",           fullAddress:"2118 Dawkins Rd, Collinsville, TX 76233",            phone:"(903) 429-6022", contact:"",              email:"", rating:"4.9", reviews:21,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"General repair",                            relScore:"", isStocking:false, inventory:[] },
  { id:93,  name:"Jesse Buttress Sand & Gravel",      type:"Construction",       town:"Collinsville", address:"182 Cobler Rd",             fullAddress:"182 Cobler Rd, Collinsville, TX 76233",              phone:"214-243-7676",   contact:"Jesse",         email:"", rating:"",    reviews:0,   priority:"Medium", status:"Customer",  acctNum:"239",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                          relScore:"", isStocking:false, inventory:[] },
  // ── TIOGA ────────────────────────────────────────────────────────────────
  { id:100, name:"Myrt's Paint & Body",               type:"Auto Body",          town:"Tioga",        address:"211 S Donaton St",          fullAddress:"211 S Donaton St, Tioga, TX 76271",                  phone:"(903) 815-5959", contact:"",              email:"", rating:"5.0", reviews:9,   priority:"Medium", status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Body shop",                                 relScore:"", isStocking:false, inventory:[] },
  { id:101, name:"USA Trucking Inc",                  type:"Trucking",           town:"Tioga",        address:"616 Bodovsky Rd",           fullAddress:"616 Bodovsky Rd, Tioga, TX 76271",                   phone:"940-437-5222",   contact:"",              email:"", rating:"3.3", reviews:7,   priority:"Medium", status:"Customer",  acctNum:"1280",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Bulk hauling",                              relScore:"", isStocking:false, inventory:[] },
  // ── KRUGERVILLE ──────────────────────────────────────────────────────────
  { id:110, name:"BURNCO Ready-Mix",                  type:"Ready Mix Concrete", town:"Krugerville",  address:"9170 Ike Byrom Rd",         fullAddress:"9170 Ike Byrom Rd, Aubrey, TX 76227",                phone:"469-647-3604",   contact:"Bryant/Roberts",email:"", rating:"4.7", reviews:6,   priority:"High",   status:"Customer",  acctNum:"2560",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Interested in Milwaukee tools.",             relScore:"", isStocking:false, inventory:[] },
  { id:111, name:"Nuts and Volts Automotive",         type:"Auto Repair",        town:"Krugerville",  address:"4900 US-377",               fullAddress:"4900 US-377, Krugerville, TX 76227",                 phone:"972-505-6132",   contact:"Tess/Ryan",     email:"", rating:"4.9", reviews:29,  priority:"High",   status:"Customer",  acctNum:"267",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Excellent relationship — call us first.",  relScore:"", isStocking:false, inventory:[] },
  { id:112, name:"META COLLISION",                    type:"Auto Body",          town:"Krugerville",  address:"8171 US-377",               fullAddress:"8171 US-377, Krugerville, TX 76227",                 phone:"(214) 783-9466", contact:"",              email:"", rating:"5.0", reviews:50,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Collision center",                          relScore:"", isStocking:false, inventory:[] },
  { id:113, name:"A-Z Bus Sales",                     type:"Fleet / Bus",        town:"Krugerville",  address:"1003 Prosperity Way",       fullAddress:"1003 Prosperity Way, Krugerville, TX 76227",         phone:"214-693-5299",   contact:"Michael/Ashley",email:"", rating:"",    reviews:0,   priority:"High",   status:"Customer",  acctNum:"238",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"AP dept follow-up. Good relationship.",    relScore:"", isStocking:false, inventory:[] },
  // ── VALLEY VIEW ──────────────────────────────────────────────────────────
  { id:120, name:"Abilene Diesel Performance DFW",    type:"Diesel Repair",      town:"Valley View",  address:"6444 E Lone Oak Rd",        fullAddress:"6444 E Lone Oak Rd, Valley View, TX 76272",          phone:"940-580-0646",   contact:"Eric/Courtney", email:"", rating:"5.0", reviews:44,  priority:"High",   status:"Customer",  acctNum:"316",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Diesel performance",                        relScore:"", isStocking:false, inventory:[] },
  // ── SHERMAN ──────────────────────────────────────────────────────────────
  { id:130, name:"Big Brand Tire & Service (Sherman)",type:"Tire Shop",          town:"Sherman",      address:"4001 Texoma Pkwy",          fullAddress:"4001 Texoma Pkwy, Sherman, TX 75090",                phone:"903-868-8072",   contact:"Mark",          email:"", rating:"",    reviews:0,   priority:"High",   status:"Customer",  acctNum:"4016",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Stocking: filters & batteries",             relScore:"", isStocking:true,  inventory:[{id:"bb-sh-1",partNum:"21348",description:"Oil Filter",parLevel:12,currentStock:0},{id:"bb-sh-2",partNum:"78-8C",description:"Battery Grp 78",parLevel:4,currentStock:0}] },
];

const STATUSES   = ["", "Customer", "Active", "Prospect", "Warm Lead", "Cold", "Not Interested"];
const PRIORITIES = ["High", "Medium", "Low"];
const ALL_TOWNS  = ["All Towns", ...Array.from(new Set(INITIAL_CUSTOMERS.map(c => c.town))).sort()];

const priorityConfig = {
  High:   { bg:"#fee2e2", text:"#991b1b", dot:"#ef4444" },
  Medium: { bg:"#fef3c7", text:"#92400e", dot:"#f59e0b" },
  Low:    { bg:"#dbeafe", text:"#1e40af", dot:"#3b82f6" },
};
const statusColors = {
  Customer:"#16a34a", Active:"#0891b2", "Warm Lead":"#d97706",
  Prospect:"#7c3aed", Cold:"#9ca3af", "Not Interested":"#dc2626", "":"#9ca3af"
};
const typeIcons = {
  "Auto Repair":"🔧","Tire Shop":"🛞","Auto Body":"🚗","Diesel Repair":"🚛","Diesel Truck":"🚛",
  "Performance":"⚡","Towing":"🪝","RV Repair":"🚌","Quick Lube":"🛢️","Restoration":"🏆",
  "Boat Repair":"⛵","Transmission Shop":"⚙️","Truck Accessories":"🛻","Construction Fleet":"🏗️",
  "Ready Mix Concrete":"🪨","Concrete Fleet":"🪨","Excavation":"⛏️","Trucking":"🚚",
  "ATV Repair":"🏍️","Auto Detailing":"✨","Auto Machine Shop":"🔩","Mechanic":"🔧",
  "Auto Restoration":"🏆","Tractor Dealer":"🚜","Tire & Oil":"🛞","Auto Parts Store":"🏪",
  "Fleet Transportation":"🚌","Jeep / Off-Road":"🏔️","Construction":"🏗️","Municipal Fleet":"🏛️",
  "Machine Shop":"🔩","Steel Fabrication":"⚙️","Golf / Fleet":"⛳","Fleet / Bus":"🚌",
};

const mapsUrl = addr => `https://maps.google.com/?q=${encodeURIComponent(addr)}`;
function multiStopMapsUrl(stops) {
  if (!stops.length) return "#";
  if (stops.length === 1) return mapsUrl(stops[0].fullAddress);
  const enc = s => encodeURIComponent(s);
  const origin = enc(stops[0].fullAddress);
  const dest   = enc(stops[stops.length-1].fullAddress);
  const wps    = stops.slice(1,-1).map(s=>enc(s.fullAddress)).join("|");
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}${wps?`&waypoints=${wps}`:""}&travelmode=driving`;
}

// ─── STYLE ATOMS ──────────────────────────────────────────────────────────────
const inp = { width:"100%", border:"1.5px solid #d1d5db", borderRadius:8, padding:"8px 10px", fontSize:13, color:"#1f2937", boxSizing:"border-box", background:"#fff" };
const sel = { border:"1.5px solid #e2e8f0", borderRadius:8, padding:"8px 10px", fontSize:13, color:"#1f2937", background:"#fff", cursor:"pointer" };
const lbl = { display:"block", fontSize:11, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4 };
const btn = (bg, color="#fff") => ({ padding:"9px 18px", background:bg, border:"none", borderRadius:8, color, fontWeight:700, cursor:"pointer", fontSize:13 });

// ─── ATOMS ────────────────────────────────────────────────────────────────────
function PriBadge({p}) {
  const c = priorityConfig[p]||{bg:"#f3f4f6",text:"#374151",dot:"#9ca3af"};
  return <span style={{background:c.bg,color:c.text,padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700,display:"inline-flex",alignItems:"center",gap:4}}><span style={{width:6,height:6,borderRadius:"50%",background:c.dot,display:"inline-block"}}/>{p}</span>;
}
function StsBadge({s}) {
  const color = statusColors[s]||"#9ca3af";
  return <span style={{background:color+"22",color,border:`1px solid ${color}44`,padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700}}>{s||"Unset"}</span>;
}
function SpendBadge({spend}) {
  const t = getSpendTier(spend);
  return <span style={{background:t.bg,color:t.color,padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700,display:"inline-flex",alignItems:"center",gap:4}}><span style={{width:6,height:6,borderRadius:"50%",background:t.dot,display:"inline-block"}}/>{t.label}</span>;
}
function AddrLink({addr, style={}}) {
  if (!addr) return <span style={{color:"#9ca3af"}}>—</span>;
  return <a href={mapsUrl(addr)} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{color:"#2563eb",fontSize:13,fontWeight:500,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:3,...style}} onMouseEnter={e=>e.currentTarget.style.textDecoration="underline"} onMouseLeave={e=>e.currentTarget.style.textDecoration="none"}>📍 {addr}</a>;
}
function Fld({label, children}) { return <div><label style={lbl}>{label}</label>{children}</div>; }

// ─── INVENTORY PANEL ──────────────────────────────────────────────────────────
function InvPanel({customer, onUpdate}) {
  const [items, setItems] = useState(customer.inventory||[]);
  const [np, setNp] = useState({partNum:"",description:"",parLevel:"",currentStock:""});
  const save = upd => { setItems(upd); onUpdate({...customer, inventory:upd}); };
  const add = () => {
    if (!np.description) return;
    save([...items,{id:`inv-${Date.now()}`,partNum:np.partNum,description:np.description,parLevel:parseInt(np.parLevel)||0,currentStock:parseInt(np.currentStock)||0}]);
    setNp({partNum:"",description:"",parLevel:"",currentStock:""});
  };
  const updateStock = (id,val) => save(items.map(i=>i.id===id?{...i,currentStock:parseInt(val)||0}:i));
  const remove = id => save(items.filter(i=>i.id!==id));
  const reorders = items.filter(i=>i.currentStock<i.parLevel);
  return (
    <div style={{marginTop:14,padding:14,background:"#f8fafc",borderRadius:10,border:"1.5px solid #e2e8f0"}}>
      <div style={{fontWeight:800,fontSize:13,color:"#1e293b",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        📦 Inventory
        {reorders.length>0&&<span style={{background:"#fee2e2",color:"#991b1b",padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700}}>⚠️ {reorders.length} to reorder</span>}
      </div>
      {items.length>0&&(
        <table style={{width:"100%",borderCollapse:"collapse",marginBottom:10,fontSize:12}}>
          <thead><tr style={{background:"#e2e8f0"}}>{["Part #","Description","Par","Stock","Status",""].map(h=><th key={h} style={{padding:"5px 7px",textAlign:"left",fontWeight:700,color:"#374151"}}>{h}</th>)}</tr></thead>
          <tbody>{items.map(item=>{
            const low=item.currentStock<item.parLevel;
            return <tr key={item.id} style={{background:low?"#fff7ed":"#fff",borderBottom:"1px solid #f1f5f9"}}>
              <td style={{padding:"5px 7px",color:"#64748b"}}>{item.partNum||"—"}</td>
              <td style={{padding:"5px 7px",fontWeight:600,color:"#1f2937"}}>{item.description}</td>
              <td style={{padding:"5px 7px",color:"#64748b"}}>{item.parLevel}</td>
              <td style={{padding:"5px 7px"}}><input type="number" value={item.currentStock} onChange={e=>updateStock(item.id,e.target.value)} style={{width:52,border:"1.5px solid #d1d5db",borderRadius:6,padding:"2px 5px",fontSize:12,textAlign:"center"}}/></td>
              <td style={{padding:"5px 7px"}}>{low?<span style={{color:"#dc2626",fontWeight:700,fontSize:11}}>🔴 REORDER</span>:<span style={{color:"#16a34a",fontWeight:700,fontSize:11}}>✅ OK</span>}</td>
              <td style={{padding:"5px 7px"}}><button onClick={()=>remove(item.id)} style={{background:"none",border:"none",color:"#dc2626",cursor:"pointer",fontSize:14,fontWeight:700}}>×</button></td>
            </tr>;
          })}</tbody>
        </table>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 2fr 72px 72px auto",gap:6,alignItems:"end"}}>
        <div><label style={{...lbl,fontSize:10}}>Part #</label><input value={np.partNum} onChange={e=>setNp(p=>({...p,partNum:e.target.value}))} placeholder="21348" style={{...inp,fontSize:12}}/></div>
        <div><label style={{...lbl,fontSize:10}}>Description</label><input value={np.description} onChange={e=>setNp(p=>({...p,description:e.target.value}))} placeholder="Oil Filter" style={{...inp,fontSize:12}}/></div>
        <div><label style={{...lbl,fontSize:10}}>Par</label><input type="number" value={np.parLevel} onChange={e=>setNp(p=>({...p,parLevel:e.target.value}))} placeholder="12" style={{...inp,fontSize:12}}/></div>
        <div><label style={{...lbl,fontSize:10}}>Stock</label><input type="number" value={np.currentStock} onChange={e=>setNp(p=>({...p,currentStock:e.target.value}))} placeholder="0" style={{...inp,fontSize:12}}/></div>
        <button onClick={add} style={{...btn("#1e293b"),padding:"8px 12px",fontSize:12,marginTop:16}}>+ Add</button>
      </div>
    </div>
  );
}

// ─── ADD CUSTOMER MODAL ───────────────────────────────────────────────────────
function AddModal({onClose, onAdd}) {
  const [f, setF] = useState({name:"",type:"Auto Repair",town:"",address:"",phone:"",contact:"",email:"",priority:"High",status:"Prospect",acctNum:"",monthlySpend:"",notes:""});
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const save = () => {
    if (!f.name.trim()) return;
    const full = f.address&&f.town?`${f.address}, ${f.town}, TX`:f.address;
    onAdd({...f, id:Date.now(), fullAddress:full, rating:"", reviews:0, supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", relScore:"", isStocking:false, inventory:[]});
    onClose();
  };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:560,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,0.3)"}}>
        <div style={{background:"#1e293b",padding:"18px 24px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{color:"#fff",fontWeight:800,fontSize:16}}>➕ Add New Customer</div>
          <button onClick={onClose} style={{color:"#94a3b8",background:"none",border:"none",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{padding:24,display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div style={{gridColumn:"1/-1"}}><Fld label="Business Name *"><input value={f.name} onChange={e=>set("name",e.target.value)} style={inp} placeholder="Business name"/></Fld></div>
          <Fld label="Type"><input value={f.type} onChange={e=>set("type",e.target.value)} style={inp}/></Fld>
          <Fld label="Town"><input value={f.town} onChange={e=>set("town",e.target.value)} style={inp} placeholder="Pilot Point"/></Fld>
          <div style={{gridColumn:"1/-1"}}><Fld label="Address"><input value={f.address} onChange={e=>set("address",e.target.value)} style={inp} placeholder="123 Main St"/></Fld></div>
          <Fld label="Phone"><input value={f.phone} onChange={e=>set("phone",e.target.value)} style={inp}/></Fld>
          <Fld label="Contact Person"><input value={f.contact} onChange={e=>set("contact",e.target.value)} style={inp}/></Fld>
          <Fld label="Email"><input value={f.email} onChange={e=>set("email",e.target.value)} style={inp} type="email"/></Fld>
          <Fld label="Acct # (POS)"><input value={f.acctNum} onChange={e=>set("acctNum",e.target.value)} style={inp}/></Fld>
          <Fld label="Est. Monthly Spend ($)"><input value={f.monthlySpend} onChange={e=>set("monthlySpend",e.target.value)} style={inp} type="number" placeholder="0"/></Fld>
          <Fld label="Priority"><select value={f.priority} onChange={e=>set("priority",e.target.value)} style={{...inp}}>{PRIORITIES.map(p=><option key={p}>{p}</option>)}</select></Fld>
          <Fld label="Status"><select value={f.status} onChange={e=>set("status",e.target.value)} style={{...inp}}>{STATUSES.filter(Boolean).map(s=><option key={s}>{s}</option>)}</select></Fld>
          <div style={{gridColumn:"1/-1"}}><Fld label="Notes"><textarea value={f.notes} onChange={e=>set("notes",e.target.value)} rows={2} style={{...inp,resize:"vertical"}}/></Fld></div>
          <div style={{gridColumn:"1/-1",display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button onClick={onClose} style={{...btn("#f1f5f9","#374151"),border:"1.5px solid #d1d5db"}}>Cancel</button>
            <button onClick={save} style={btn("#1e293b")}>Add Customer</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CUSTOMER DETAIL MODAL ────────────────────────────────────────────────────
function DetailModal({customer, onClose, onSave, onDelete}) {
  const [f, setF] = useState({...customer});
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const [confirmDel, setConfirmDel] = useState(false);
  const save = () => { const full=f.address&&f.town?`${f.address}, ${f.town}, TX`:f.fullAddress; onSave({...f,fullAddress:full}); onClose(); };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:700,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,0.3)"}}>
        <div style={{background:"#1e293b",padding:"20px 24px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{color:"#94a3b8",fontSize:12,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:2}}>{f.town} · {f.type}{f.acctNum?` · Acct #${f.acctNum}`:""}</div>
            <div style={{color:"#fff",fontWeight:800,fontSize:18}}>{f.name}</div>
            <div style={{marginTop:6,display:"flex",gap:6,flexWrap:"wrap"}}>
              <PriBadge p={f.priority}/>{f.status&&<StsBadge s={f.status}/>}<SpendBadge spend={f.monthlySpend}/>
              {f.isStocking&&<span style={{background:"#7c3aed22",color:"#7c3aed",border:"1px solid #7c3aed44",padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700}}>📦 Stocking</span>}
            </div>
          </div>
          <button onClick={onClose} style={{color:"#94a3b8",background:"none",border:"none",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{padding:24}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18,padding:14,background:"#f8fafc",borderRadius:10}}>
            <div><label style={lbl}>📍 Address</label><AddrLink addr={f.fullAddress||f.address}/></div>
            <div><label style={lbl}>📞 Phone</label>{f.phone?<a href={`tel:${f.phone}`} style={{color:"#2563eb",fontSize:13,fontWeight:500,textDecoration:"none"}}>{f.phone}</a>:<span style={{color:"#9ca3af",fontSize:13}}>—</span>}</div>
            {f.rating&&<div><label style={lbl}>⭐ Rating</label><span style={{fontSize:13,fontWeight:700,color:"#1f2937"}}>★ {f.rating} ({f.reviews} reviews)</span></div>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
            <Fld label="Contact Person"><input value={f.contact||""} onChange={e=>set("contact",e.target.value)} style={inp}/></Fld>
            <Fld label="Email"><input value={f.email||""} onChange={e=>set("email",e.target.value)} style={inp} type="email"/></Fld>
            <Fld label="Current Supplier"><input value={f.supplier||""} onChange={e=>set("supplier",e.target.value)} style={inp}/></Fld>
            <Fld label="Est. Monthly Spend ($)"><input value={f.monthlySpend||""} onChange={e=>set("monthlySpend",e.target.value)} style={inp} type="number" placeholder="0"/></Fld>
            <Fld label="Last Visit"><input value={f.lastVisit||""} onChange={e=>set("lastVisit",e.target.value)} style={inp} type="date"/></Fld>
            <Fld label="Last Call"><input value={f.lastCall||""} onChange={e=>set("lastCall",e.target.value)} style={inp} type="date"/></Fld>
            <Fld label="Next Follow-Up"><input value={f.nextFollowUp||""} onChange={e=>set("nextFollowUp",e.target.value)} style={inp} type="date"/></Fld>
            <Fld label="Status"><select value={f.status||""} onChange={e=>set("status",e.target.value)} style={{...inp}}>{STATUSES.map(s=><option key={s} value={s}>{s||"— Select —"}</option>)}</select></Fld>
            <Fld label="Priority"><select value={f.priority} onChange={e=>set("priority",e.target.value)} style={{...inp}}>{PRIORITIES.map(p=><option key={p}>{p}</option>)}</select></Fld>
            <Fld label="Relationship Score (1–10)"><input value={f.relScore||""} onChange={e=>set("relScore",e.target.value)} style={inp} type="number" min="1" max="10" placeholder="1–10"/></Fld>
          </div>
          <div style={{marginBottom:14}}><Fld label="📝 Notes"><textarea value={f.notes||""} onChange={e=>set("notes",e.target.value)} rows={3} style={{...inp,resize:"vertical"}}/></Fld></div>
          {/* Stocking toggle */}
          <div style={{marginBottom:14,padding:"12px 16px",background:"#f0f9ff",borderRadius:10,border:"1.5px solid #bae6fd",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontWeight:700,fontSize:13,color:"#0c4a6e"}}>📦 Stocking Account</div>
              <div style={{fontSize:12,color:"#0369a1",marginTop:2}}>Enable to track inventory and reorder alerts</div>
            </div>
            <button onClick={()=>set("isStocking",!f.isStocking)} style={{...btn(f.isStocking?"#16a34a":"#d1d5db",f.isStocking?"#fff":"#374151"),minWidth:64}}>{f.isStocking?"ON":"OFF"}</button>
          </div>
          {f.isStocking&&<InvPanel customer={f} onUpdate={upd=>setF(upd)}/>}
          <div style={{display:"flex",gap:10,justifyContent:"space-between",marginTop:18}}>
            <div>{!confirmDel
              ?<button onClick={()=>setConfirmDel(true)} style={{...btn("#fee2e2","#dc2626"),border:"1.5px solid #fca5a5"}}>🗑 Remove</button>
              :<div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:12,color:"#dc2626",fontWeight:600}}>Sure?</span><button onClick={()=>{onDelete(customer.id);onClose();}} style={btn("#dc2626")}>Delete</button><button onClick={()=>setConfirmDel(false)} style={btn("#f1f5f9","#374151")}>Cancel</button></div>}
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={onClose} style={{...btn("#f1f5f9","#374151"),border:"1.5px solid #d1d5db"}}>Cancel</button>
              <button onClick={save} style={btn("#1e293b")}>Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ROUTE PLANNER ────────────────────────────────────────────────────────────
function RoutePlanner({customers, onClose}) {
  const [stops, setStops] = useState([]);
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState([]);
  const [routeName, setRouteName] = useState("");

  const pool = customers.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||c.town.toLowerCase().includes(search.toLowerCase())).slice(0,50);
  const toggle = c => setStops(p=>p.find(s=>s.id===c.id)?p.filter(s=>s.id!==c.id):[...p,c]);
  const moveUp = i => { if(i===0)return; const s=[...stops]; [s[i-1],s[i]]=[s[i],s[i-1]]; setStops(s); };
  const moveDown = i => { if(i===stops.length-1)return; const s=[...stops]; [s[i],s[i+1]]=[s[i+1],s[i]]; setStops(s); };
  const saveRoute = () => { if(!routeName.trim()||!stops.length)return; setSaved(r=>[...r,{name:routeName,stops:[...stops]}]); setRouteName(""); };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:840,maxHeight:"93vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,0.3)"}}>
        <div style={{background:"#1e293b",padding:"20px 24px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{color:"#fff",fontWeight:800,fontSize:18}}>🗺️ Route Planner</div><div style={{color:"#64748b",fontSize:12,marginTop:2}}>Build your day — opens Google Maps with all stops loaded</div></div>
          <button onClick={onClose} style={{color:"#94a3b8",background:"none",border:"none",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr"}}>
          {/* Picker */}
          <div style={{padding:20,borderRight:"1.5px solid #e2e8f0"}}>
            <div style={{fontWeight:700,fontSize:13,color:"#374151",marginBottom:8}}>Select Stops</div>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search..." style={{...inp,marginBottom:8}}/>
            <div style={{maxHeight:400,overflowY:"auto"}}>
              {pool.map(c=>{
                const sel=stops.find(s=>s.id===c.id);
                return <div key={c.id} onClick={()=>toggle(c)} style={{padding:"9px 11px",borderRadius:8,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4,background:sel?"#e0f2fe":"#f8fafc",border:sel?"1.5px solid #38bdf8":"1.5px solid transparent",transition:"all 0.1s"}}>
                  <div><div style={{fontWeight:700,fontSize:13,color:"#1e293b"}}>{typeIcons[c.type]||"🏪"} {c.name}</div><div style={{fontSize:11,color:"#64748b"}}>{c.town} · {c.address}</div></div>
                  <div style={{fontSize:17}}>{sel?"✅":"⬜"}</div>
                </div>;
              })}
            </div>
          </div>
          {/* Builder */}
          <div style={{padding:20}}>
            <div style={{fontWeight:700,fontSize:13,color:"#374151",marginBottom:8}}>Your Route ({stops.length} stops)</div>
            {!stops.length&&<div style={{color:"#94a3b8",fontSize:13,textAlign:"center",padding:"36px 0"}}>Select customers on the left</div>}
            <div style={{maxHeight:260,overflowY:"auto",marginBottom:10}}>
              {stops.map((c,i)=>(
                <div key={c.id} style={{padding:"7px 10px",background:"#f8fafc",borderRadius:8,marginBottom:4,display:"flex",alignItems:"center",gap:8,border:"1.5px solid #e2e8f0"}}>
                  <span style={{fontWeight:800,fontSize:12,color:"#64748b",minWidth:18}}>{i+1}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:12,color:"#1e293b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                    <div style={{fontSize:11,color:"#64748b"}}>{c.town}</div>
                  </div>
                  <div style={{display:"flex",gap:2}}>
                    <button onClick={()=>moveUp(i)} style={{background:"none",border:"1px solid #e2e8f0",borderRadius:4,cursor:"pointer",fontSize:10,padding:"2px 5px",color:"#64748b"}}>↑</button>
                    <button onClick={()=>moveDown(i)} style={{background:"none",border:"1px solid #e2e8f0",borderRadius:4,cursor:"pointer",fontSize:10,padding:"2px 5px",color:"#64748b"}}>↓</button>
                    <button onClick={()=>setStops(stops.filter(s=>s.id!==c.id))} style={{background:"none",border:"none",cursor:"pointer",fontSize:14,color:"#dc2626",fontWeight:700}}>×</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              <input value={routeName} onChange={e=>setRouteName(e.target.value)} placeholder='Name (e.g. "Tuesday North")' style={{...inp,flex:1}}/>
              <button onClick={saveRoute} style={btn("#475569")}>Save</button>
            </div>
            {saved.length>0&&<div style={{marginBottom:10}}>
              <div style={{fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:5}}>Saved Routes</div>
              {saved.map((r,i)=><button key={i} onClick={()=>setStops([...r.stops])} style={{display:"block",width:"100%",textAlign:"left",padding:"6px 10px",background:"#f1f5f9",border:"1px solid #e2e8f0",borderRadius:6,marginBottom:4,cursor:"pointer",fontSize:12,color:"#374151",fontWeight:600}}>📍 {r.name} ({r.stops.length} stops)</button>)}
            </div>}
            <a href={stops.length?multiStopMapsUrl(stops):"#"} target="_blank" rel="noopener noreferrer" style={{display:"block",textAlign:"center",padding:"13px 0",background:stops.length?"#16a34a":"#d1d5db",color:"#fff",borderRadius:10,fontWeight:800,fontSize:14,textDecoration:"none",opacity:stops.length?1:0.6,pointerEvents:stops.length?"auto":"none"}}>
              🗺️ Open Full Route in Google Maps
            </a>
            {stops.length>0&&<div style={{textAlign:"center",fontSize:11,color:"#64748b",marginTop:5}}>Opens Google Maps with all {stops.length} stops — turn-by-turn navigation ready</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── INVENTORY DASHBOARD ──────────────────────────────────────────────────────
function InvDash({customers, onUpdate, onClose}) {
  const accts = customers.filter(c=>c.isStocking);
  const alerts = accts.flatMap(c=>(c.inventory||[]).filter(i=>i.currentStock<i.parLevel).map(i=>({...i,cName:c.name,cTown:c.town})));
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:780,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,0.3)"}}>
        <div style={{background:"#1e293b",padding:"20px 24px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{color:"#fff",fontWeight:800,fontSize:18}}>📦 Stocking Account Inventory</div><div style={{color:"#64748b",fontSize:12,marginTop:2}}>{accts.length} stocking accounts · {alerts.length} items need reorder</div></div>
          <button onClick={onClose} style={{color:"#94a3b8",background:"none",border:"none",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{padding:24}}>
          {alerts.length>0&&<div style={{background:"#fff7ed",border:"1.5px solid #fed7aa",borderRadius:10,padding:14,marginBottom:20}}>
            <div style={{fontWeight:800,fontSize:13,color:"#c2410c",marginBottom:10}}>⚠️ Reorder Alerts</div>
            {alerts.map((item,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #fed7aa"}}>
              <div><span style={{fontWeight:700,fontSize:13,color:"#1e293b"}}>{item.description}</span>{item.partNum&&<span style={{color:"#64748b",fontSize:12}}> · #{item.partNum}</span>}</div>
              <div style={{fontSize:12,color:"#64748b"}}>{item.cName} · Stock: <b style={{color:"#dc2626"}}>{item.currentStock}</b> / Par: {item.parLevel}</div>
            </div>)}
          </div>}
          {accts.map(c=>(
            <div key={c.id} style={{marginBottom:20,padding:16,border:"1.5px solid #e2e8f0",borderRadius:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div><div style={{fontWeight:800,fontSize:14,color:"#1e293b"}}>{c.name}</div><div style={{fontSize:12,color:"#64748b"}}>{c.town}{c.contact?` · ${c.contact}`:""}</div></div>
                <AddrLink addr={c.fullAddress}/>
              </div>
              <InvPanel customer={c} onUpdate={onUpdate}/>
            </div>
          ))}
          {!accts.length&&<div style={{textAlign:"center",padding:40,color:"#94a3b8"}}><div style={{fontSize:36,marginBottom:8}}>📦</div><div>No stocking accounts yet.<br/>Enable "Stocking Account" on any customer to start tracking.</div></div>}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [customers, setCustomers]     = useState(INITIAL_CUSTOMERS);
  const [search, setSearch]           = useState("");
  const [townF,  setTownF]            = useState("All Towns");
  const [priF,   setPriF]             = useState("All");
  const [stsF,   setStsF]             = useState("");
  const [sortBy, setSortBy]           = useState("priority");
  const [viewMode, setViewMode]       = useState("grid");
  const [selected, setSelected]       = useState(null);
  const [showAdd, setShowAdd]         = useState(false);
  const [showRoute, setShowRoute]     = useState(false);
  const [showInv, setShowInv]         = useState(false);
  const [activeTab, setActiveTab]     = useState("all");

  const updC = useCallback(u=>setCustomers(cs=>cs.map(c=>c.id===u.id?u:c)),[]);
  const delC = useCallback(id=>setCustomers(cs=>cs.filter(c=>c.id!==id)),[]);
  const addC = useCallback(c=>setCustomers(cs=>[...cs,c]),[]);

  const filtered = useMemo(()=>{
    let list = activeTab==="stocking" ? customers.filter(c=>c.isStocking) : customers;
    if(search){const q=search.toLowerCase(); list=list.filter(c=>c.name.toLowerCase().includes(q)||c.type.toLowerCase().includes(q)||c.town.toLowerCase().includes(q)||(c.notes||"").toLowerCase().includes(q)||(c.contact||"").toLowerCase().includes(q)||(c.acctNum||"").includes(q));}
    if(townF!=="All Towns") list=list.filter(c=>c.town===townF);
    if(priF!=="All") list=list.filter(c=>c.priority===priF);
    if(stsF) list=list.filter(c=>c.status===stsF);
    const ord={High:0,Medium:1,Low:2};
    if(sortBy==="priority")  list=[...list].sort((a,b)=>(ord[a.priority]??3)-(ord[b.priority]??3));
    else if(sortBy==="spend") list=[...list].sort((a,b)=>(parseFloat(b.monthlySpend)||0)-(parseFloat(a.monthlySpend)||0));
    else if(sortBy==="rating")   list=[...list].sort((a,b)=>(parseFloat(b.rating)||0)-(parseFloat(a.rating)||0));
    else if(sortBy==="followup") list=[...list].sort((a,b)=>(a.nextFollowUp||"9999")<(b.nextFollowUp||"9999")?-1:1);
    else if(sortBy==="name") list=[...list].sort((a,b)=>a.name.localeCompare(b.name));
    return list;
  },[customers,search,townF,priF,stsF,sortBy,activeTab]);

  const stats = useMemo(()=>({
    total:    customers.length,
    active:   customers.filter(c=>c.status==="Customer"||c.status==="Active").length,
    followups:customers.filter(c=>c.nextFollowUp).length,
    stocking: customers.filter(c=>c.isStocking).length,
    reorders: customers.filter(c=>c.isStocking).flatMap(c=>(c.inventory||[]).filter(i=>i.currentStock<i.parLevel)).length,
  }),[customers]);

  return (
    <div style={{fontFamily:"'Trebuchet MS','Segoe UI',sans-serif",background:"#f1f5f9",minHeight:"100vh"}}>

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div style={{background:"#1e293b",padding:"0 24px",position:"sticky",top:0,zIndex:50,borderBottom:"2px solid #ef4444"}}>
        <div style={{maxWidth:1440,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:62}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{background:"#ef4444",borderRadius:8,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:18,color:"#fff"}}>N</div>
            <div>
              <div style={{color:"#fff",fontWeight:800,fontSize:15,letterSpacing:"-0.3px"}}>NAPA Sales Territory</div>
              <div style={{color:"#475569",fontSize:11}}>North Texas CRM</div>
            </div>
          </div>
          <div style={{display:"flex",gap:22,alignItems:"center"}}>
            {[["🏢",stats.total,"Accounts"],["✅",stats.active,"Customers"],["📅",stats.followups,"Follow-ups"],["🔴",stats.reorders,"Reorders"]].map(([icon,val,label])=>(
              <div key={label} style={{textAlign:"center"}}>
                <div style={{color:val>0&&label==="Reorders"?"#ef4444":"#fff",fontWeight:800,fontSize:17,lineHeight:1}}>{icon} {val}</div>
                <div style={{color:"#475569",fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</div>
              </div>
            ))}
            <div style={{display:"flex",gap:7}}>
              <button onClick={()=>setShowRoute(true)}  style={{...btn("#334155"),fontSize:12}}>🗺️ Route</button>
              <button onClick={()=>setShowInv(true)}    style={{...btn(stats.reorders>0?"#dc2626":"#334155"),fontSize:12}}>📦 Inventory{stats.reorders>0?` (${stats.reorders})`:""}</button>
              <button onClick={()=>setShowAdd(true)}    style={{...btn("#ef4444"),fontSize:12}}>➕ Add</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS ────────────────────────────────────────────────────────── */}
      <div style={{background:"#fff",borderBottom:"1px solid #e2e8f0",padding:"0 24px"}}>
        <div style={{maxWidth:1440,margin:"0 auto",display:"flex"}}>
          {[["all","📋 All Accounts"],["stocking",`📦 Stocking (${stats.stocking})`]].map(([tab,label])=>(
            <button key={tab} onClick={()=>setActiveTab(tab)} style={{padding:"12px 20px",border:"none",background:"none",borderBottom:activeTab===tab?"3px solid #ef4444":"3px solid transparent",color:activeTab===tab?"#ef4444":"#64748b",fontWeight:700,fontSize:13,cursor:"pointer",transition:"all 0.15s"}}>{label}</button>
          ))}
        </div>
      </div>

      {/* ── FILTERS ─────────────────────────────────────────────────────── */}
      <div style={{background:"#fff",borderBottom:"1px solid #e2e8f0",padding:"9px 24px"}}>
        <div style={{maxWidth:1440,margin:"0 auto",display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          <input placeholder="🔍  Search name, town, type, notes, acct#..." value={search} onChange={e=>setSearch(e.target.value)} style={{flex:"1 1 220px",...inp,outline:"none"}}/>
          <select value={townF} onChange={e=>setTownF(e.target.value)} style={sel}>{ALL_TOWNS.map(t=><option key={t}>{t}</option>)}</select>
          <select value={priF}  onChange={e=>setPriF(e.target.value)}  style={sel}><option value="All">All Priorities</option>{PRIORITIES.map(p=><option key={p}>{p}</option>)}</select>
          <select value={stsF}  onChange={e=>setStsF(e.target.value)}  style={sel}><option value="">All Statuses</option>{STATUSES.filter(Boolean).map(s=><option key={s}>{s}</option>)}</select>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={sel}>
            <option value="priority">Sort: Priority</option>
            <option value="spend">Sort: Spend $</option>
            <option value="rating">Sort: Rating</option>
            <option value="followup">Sort: Follow-up Date</option>
            <option value="name">Sort: Name A–Z</option>
          </select>
          <div style={{display:"flex",border:"1.5px solid #e2e8f0",borderRadius:8,overflow:"hidden"}}>
            {[["grid","⊞"],["list","☰"]].map(([v,icon])=>(
              <button key={v} onClick={()=>setViewMode(v)} style={{padding:"7px 13px",border:"none",background:viewMode===v?"#1e293b":"#fff",color:viewMode===v?"#fff":"#64748b",cursor:"pointer",fontSize:15}}>{icon}</button>
            ))}
          </div>
          <div style={{color:"#64748b",fontSize:12,fontWeight:600}}>{filtered.length} shown</div>
        </div>
      </div>

      {/* ── SPEND LEGEND ────────────────────────────────────────────────── */}
      <div style={{background:"#fff",borderBottom:"1px solid #e2e8f0",padding:"5px 24px"}}>
        <div style={{maxWidth:1440,margin:"0 auto",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <span style={{fontSize:11,color:"#64748b",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em"}}>Monthly Spend:</span>
          {SPEND_TIERS.map(t=><span key={t.label} style={{background:t.bg,color:t.color,padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700,display:"inline-flex",alignItems:"center",gap:3}}><span style={{width:6,height:6,borderRadius:"50%",background:t.dot,display:"inline-block"}}/>{t.label}</span>)}
        </div>
      </div>

      {/* ── CONTENT ─────────────────────────────────────────────────────── */}
      <div style={{maxWidth:1440,margin:"0 auto",padding:"16px 24px"}}>
        {viewMode==="grid"?(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(298px,1fr))",gap:13}}>
            {filtered.map(c=>{
              const t=getSpendTier(c.monthlySpend);
              return <div key={c.id} onClick={()=>setSelected(c)} style={{background:"#fff",borderRadius:12,padding:16,cursor:"pointer",border:"1.5px solid #e2e8f0",borderLeft:`4px solid ${t.dot}`,boxShadow:"0 1px 3px rgba(0,0,0,0.05)",transition:"all 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 6px 16px rgba(0,0,0,0.1)";e.currentTarget.style.transform="translateY(-1px)";}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.05)";e.currentTarget.style.transform="none";}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div style={{fontSize:22}}>{typeIcons[c.type]||"🏪"}</div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"flex-end"}}>
                    <PriBadge p={c.priority}/>{c.status&&<StsBadge s={c.status}/>}
                    {c.isStocking&&<span style={{background:"#7c3aed22",color:"#7c3aed",border:"1px solid #7c3aed44",padding:"2px 6px",borderRadius:20,fontSize:10,fontWeight:700}}>📦</span>}
                  </div>
                </div>
                <div style={{fontWeight:800,fontSize:14,color:"#1e293b",marginBottom:2,lineHeight:1.3}}>{c.name}</div>
                <div style={{fontSize:11,color:"#64748b",fontWeight:600,marginBottom:5}}>{c.town} · {c.type}{c.acctNum?` · #${c.acctNum}`:""}</div>
                <AddrLink addr={c.fullAddress||c.address} style={{fontSize:12,marginBottom:5,display:"block"}}/>
                {c.contact&&<div style={{fontSize:12,color:"#475569",marginBottom:4}}>👤 {c.contact}</div>}
                {c.notes&&<div style={{fontSize:12,color:"#64748b",marginBottom:8,lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{c.notes}</div>}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:8,borderTop:"1px solid #f1f5f9"}}>
                  <SpendBadge spend={c.monthlySpend}/>
                  {c.rating?<span style={{fontSize:12,color:"#f59e0b",fontWeight:700}}>★ {c.rating}</span>:<span style={{fontSize:12,color:"#d1d5db"}}>No rating</span>}
                </div>
                {c.nextFollowUp&&<div style={{marginTop:7,padding:"4px 8px",background:"#fef3c7",borderRadius:6,fontSize:11,color:"#92400e",fontWeight:600}}>📅 Follow-up: {c.nextFollowUp}</div>}
                {c.isStocking&&(c.inventory||[]).some(i=>i.currentStock<i.parLevel)&&<div style={{marginTop:5,padding:"4px 8px",background:"#fee2e2",borderRadius:6,fontSize:11,color:"#991b1b",fontWeight:700}}>🔴 Inventory reorder needed</div>}
              </div>;
            })}
          </div>
        ):(
          <div style={{background:"#fff",borderRadius:12,border:"1.5px solid #e2e8f0",overflow:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:960}}>
              <thead>
                <tr style={{background:"#f8fafc",borderBottom:"2px solid #e2e8f0"}}>
                  {["Business","Town","Type","Acct #","Address","Phone","Contact","Spend","Priority","Status","Follow-Up"].map(h=>(
                    <th key={h} style={{padding:"9px 11px",fontSize:11,fontWeight:700,color:"#64748b",textAlign:"left",textTransform:"uppercase",letterSpacing:"0.05em",whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c,i)=>(
                  <tr key={c.id} onClick={()=>setSelected(c)} style={{borderBottom:"1px solid #f1f5f9",cursor:"pointer",background:i%2===0?"#fff":"#fafbfc"}}
                    onMouseEnter={e=>e.currentTarget.style.background="#f0f9ff"}
                    onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#fff":"#fafbfc"}>
                    <td style={{padding:"8px 11px",fontWeight:700,fontSize:13,color:"#1e293b",whiteSpace:"nowrap"}}>{typeIcons[c.type]||"🏪"} {c.name}{c.isStocking?" 📦":""}</td>
                    <td style={{padding:"8px 11px",fontSize:12,color:"#64748b"}}>{c.town}</td>
                    <td style={{padding:"8px 11px",fontSize:12,color:"#64748b"}}>{c.type}</td>
                    <td style={{padding:"8px 11px",fontSize:12,color:"#64748b"}}>{c.acctNum||"—"}</td>
                    <td style={{padding:"8px 11px"}}><AddrLink addr={c.address} style={{fontSize:11}}/></td>
                    <td style={{padding:"8px 11px",fontSize:12,color:"#64748b",whiteSpace:"nowrap"}}>{c.phone||"—"}</td>
                    <td style={{padding:"8px 11px",fontSize:12,color:"#64748b"}}>{c.contact||"—"}</td>
                    <td style={{padding:"8px 11px"}}><SpendBadge spend={c.monthlySpend}/></td>
                    <td style={{padding:"8px 11px"}}><PriBadge p={c.priority}/></td>
                    <td style={{padding:"8px 11px"}}>{c.status?<StsBadge s={c.status}/>:<span style={{color:"#d1d5db",fontSize:12}}>—</span>}</td>
                    <td style={{padding:"8px 11px",fontSize:12,color:c.nextFollowUp?"#92400e":"#d1d5db",fontWeight:c.nextFollowUp?600:400,whiteSpace:"nowrap"}}>{c.nextFollowUp||"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!filtered.length&&<div style={{textAlign:"center",padding:60,color:"#94a3b8"}}><div style={{fontSize:40,marginBottom:12}}>🔍</div><div style={{fontWeight:700,fontSize:18}}>No accounts found</div><div style={{fontSize:14,marginTop:4}}>Try adjusting your filters</div></div>}
      </div>

      {/* ── MODALS ──────────────────────────────────────────────────────── */}
      {selected    && <DetailModal customer={selected} onClose={()=>setSelected(null)} onSave={c=>{updC(c);setSelected(null);}} onDelete={id=>{delC(id);setSelected(null);}}/>}
      {showAdd     && <AddModal    onClose={()=>setShowAdd(false)}  onAdd={addC}/>}
      {showRoute   && <RoutePlanner customers={customers}           onClose={()=>setShowRoute(false)}/>}
      {showInv     && <InvDash     customers={customers} onUpdate={updC} onClose={()=>setShowInv(false)}/>}
    </div>
  );
}

