import { useState, useMemo, useCallback } from "react";

// ─── SPEND TIERS ─────────────────────────────────────────────────────────────
const SPEND_TIERS = [
  { label:"$1,500+",    min:1500, max:Infinity, color:"#16a34a", bg:"#dcfce7", dot:"#16a34a" },
  { label:"$750–1,500", min:750,  max:1499,     color:"#0891b2", bg:"#cffafe", dot:"#0891b2" },
  { label:"$500–750",   min:500,  max:749,       color:"#d97706", bg:"#fef3c7", dot:"#d97706" },
  { label:"$250–500",   min:250,  max:499,       color:"#ea580c", bg:"#ffedd5", dot:"#ea580c" },
  { label:"<$250",      min:1,    max:249,       color:"#dc2626", bg:"#fee2e2", dot:"#dc2626" },
  { label:"Prospect",   min:0,    max:0,         color:"#6b7280", bg:"#f3f4f6", dot:"#9ca3af" },
];
const getSpendTier = spend => {
  const n = parseFloat(spend)||0;
  if (!n) return SPEND_TIERS[5];
  return SPEND_TIERS.find(t=>n>=t.min&&n<=t.max)||SPEND_TIERS[5];
};

// ─── CUSTOMER DATA ────────────────────────────────────────────────────────────
const INITIAL_CUSTOMERS = [
  { id:1,   name:"JB's Auto Repair",                  type:"Auto Repair",        town:"Pilot Point",  address:"615 S Massey St",         fullAddress:"615 S Massey St, Pilot Point, TX 76258",            phone:"940-273-3323",   contact:"James",         email:"", rating:"",    reviews:0,   priority:"High",   status:"Customer",  acctNum:"1",     monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                         relScore:"", isStocking:false, inventory:[] },
  { id:2,   name:"Al's Qwik E Lube",                  type:"Quick Lube",         town:"Pilot Point",  address:"1117 US-377",              fullAddress:"1117 US-377, Pilot Point, TX 76258",                phone:"(940) 686-5823", contact:"",              email:"", rating:"4.5", reviews:94,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Bulk oil / recurring",                     relScore:"", isStocking:false, inventory:[] },
  { id:3,   name:"Bryant's Tire Shop",                type:"Tire Shop",          town:"Pilot Point",  address:"400 US-377",               fullAddress:"400 US-377, Pilot Point, TX 76258",                 phone:"940-286-8473",   contact:"",              email:"", rating:"4.6", reviews:164, priority:"High",   status:"Customer",  acctNum:"288",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Used tires",                               relScore:"", isStocking:false, inventory:[] },
  { id:4,   name:"Key Auto Repairs",                  type:"Auto Repair",        town:"Pilot Point",  address:"608 N Washington St",      fullAddress:"608 N Washington St, Pilot Point, TX 76258",        phone:"940-218-5439",   contact:"Steven",        email:"", rating:"4.9", reviews:41,  priority:"High",   status:"Customer",  acctNum:"235",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"General repairs",                          relScore:"", isStocking:false, inventory:[] },
  { id:5,   name:"Caliber Collision",                 type:"Auto Body",          town:"Pilot Point",  address:"8600 US-377",              fullAddress:"8600 US-377, Pilot Point, TX 76258",                phone:"(940) 290-0305", contact:"",              email:"", rating:"4.9", reviews:79,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Collision / body",                         relScore:"", isStocking:false, inventory:[] },
  { id:6,   name:"Mark's Body Shop",                  type:"Auto Body",          town:"Pilot Point",  address:"1112 US-377",              fullAddress:"1112 US-377, Pilot Point, TX 76258",                phone:"940-686-5194",   contact:"Mark",          email:"", rating:"4.9", reviews:40,  priority:"High",   status:"Customer",  acctNum:"1350",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Body shop",                                relScore:"", isStocking:false, inventory:[] },
  { id:7,   name:"Speed Shop Garage",                 type:"Restoration",        town:"Pilot Point",  address:"1145 Jc Ln",               fullAddress:"1145 Jc Ln, Pilot Point, TX 76258",                 phone:"(469) 756-9065", contact:"",              email:"", rating:"5.0", reviews:1,   priority:"Medium", status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Classic restoration",                      relScore:"", isStocking:false, inventory:[] },
  { id:8,   name:"R&M Garage LLC",                    type:"Auto Repair",        town:"Pilot Point",  address:"10221 FM 455 E",           fullAddress:"10221 FM 455 E, Pilot Point, TX 76258",             phone:"214-354-3353",   contact:"Brian",         email:"", rating:"4.9", reviews:39,  priority:"High",   status:"Customer",  acctNum:"1851",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Full service",                             relScore:"", isStocking:false, inventory:[] },
  { id:9,   name:"All American Towing",               type:"Towing",             town:"Pilot Point",  address:"561 E Blackjack Rd",       fullAddress:"561 E Blackjack Rd, Pilot Point, TX 76258",         phone:"(940) 627-2800", contact:"",              email:"", rating:"4.2", reviews:82,  priority:"Medium", status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Fleet / towing",                           relScore:"", isStocking:false, inventory:[] },
  { id:10,  name:"Dan's Equipment Sales",             type:"Tractor Dealer",     town:"Pilot Point",  address:"1212 S Washington St",     fullAddress:"1212 S Washington St, Pilot Point, TX 76258",       phone:"940-206-2809",   contact:"Dan",           email:"", rating:"4.3", reviews:27,  priority:"High",   status:"Customer",  acctNum:"1440",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Equipment / tractor sales",                relScore:"", isStocking:false, inventory:[] },
  { id:11,  name:"Big Brand Tire & Service (PP)",     type:"Tire Shop",          town:"Pilot Point",  address:"1321 N Hwy 377",           fullAddress:"1321 N Hwy 377, Pilot Point, TX 76258",             phone:"940-686-8473",   contact:"John",          email:"", rating:"4.7", reviews:573, priority:"High",   status:"Customer",  acctNum:"4017",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Stocking: filters & batteries",            relScore:"", isStocking:true,  inventory:[{id:"bb-pp-1",partNum:"21348",description:"Oil Filter",parLevel:12,currentStock:0},{id:"bb-pp-2",partNum:"78-8C",description:"Battery Grp 78",parLevel:4,currentStock:0}] },
  { id:12,  name:"Luna's Mod Shop",                   type:"Mechanic",           town:"Pilot Point",  address:"703 Brenda's Way",         fullAddress:"703 Brenda's Way, Pilot Point, TX 76258",           phone:"214-500-7137",   contact:"Alex",          email:"", rating:"5.0", reviews:42,  priority:"High",   status:"Customer",  acctNum:"201",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"General mechanic",                         relScore:"", isStocking:false, inventory:[] },
  { id:13,  name:"Sanchez Tire Shop",                 type:"Tire Shop",          town:"Pilot Point",  address:"208 W Walcott St",         fullAddress:"208 W Walcott St, Pilot Point, TX 76258",           phone:"940-300-7209",   contact:"Sanchez",       email:"", rating:"4.4", reviews:28,  priority:"High",   status:"Customer",  acctNum:"39",    monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Tire service",                             relScore:"", isStocking:false, inventory:[] },
  { id:14,  name:"JJRush Performance & Automotive",   type:"Auto Repair",        town:"Pilot Point",  address:"303 W Walcott St",         fullAddress:"303 W Walcott St, Pilot Point, TX 76258",           phone:"940-686-6860",   contact:"JJ",            email:"", rating:"4.2", reviews:137, priority:"High",   status:"Customer",  acctNum:"17",    monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Performance automotive",                   relScore:"", isStocking:false, inventory:[] },
  { id:15,  name:"Platinum Ford North (Parts)",       type:"Auto Parts Store",   town:"Pilot Point",  address:"11590 S Hwy 377",          fullAddress:"11590 S Hwy 377, Pilot Point, TX 76258",            phone:"940-686-2236",   contact:"Jack",          email:"", rating:"5.0", reviews:4,   priority:"High",   status:"Customer",  acctNum:"1410",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Dealership parts department",              relScore:"", isStocking:false, inventory:[] },
  { id:16,  name:"Paschal Performance",               type:"Auto Repair",        town:"Pilot Point",  address:"930 N Hwy 377",            fullAddress:"930 N Hwy 377, Pilot Point, TX 76258",              phone:"817-578-5308",   contact:"",              email:"", rating:"",    reviews:0,   priority:"Medium", status:"Customer",  acctNum:"231",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                         relScore:"", isStocking:false, inventory:[] },
  { id:17,  name:"Outback Garage",                    type:"Auto Repair",        town:"Pilot Point",  address:"1321 N Saint James Rd",    fullAddress:"1321 N Saint James Rd, Pilot Point, TX 76258",      phone:"940-300-1149",   contact:"",              email:"", rating:"",    reviews:0,   priority:"Medium", status:"Customer",  acctNum:"819",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                         relScore:"", isStocking:false, inventory:[] },
  { id:18,  name:"TNJ's Automotive",                  type:"Auto Repair",        town:"Pilot Point",  address:"700 N Jefferson St",       fullAddress:"700 N Jefferson St, Pilot Point, TX 76258",         phone:"940-442-3811",   contact:"Tony",          email:"", rating:"",    reviews:0,   priority:"High",   status:"Customer",  acctNum:"186",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                         relScore:"", isStocking:false, inventory:[] },
  { id:19,  name:"North TX Precision Machining",      type:"Machine Shop",       town:"Pilot Point",  address:"1216 N Hwy 377",           fullAddress:"1216 N Hwy 377, Pilot Point, TX 76258",             phone:"940-686-2326",   contact:"",              email:"", rating:"",    reviews:0,   priority:"Medium", status:"Customer",  acctNum:"145",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                         relScore:"", isStocking:false, inventory:[] },
  { id:20,  name:"Staley Steel",                      type:"Steel Fabrication",  town:"Pilot Point",  address:"9620 St John Rd",          fullAddress:"9620 St John Rd, Pilot Point, TX 76258",            phone:"940-686-6000",   contact:"Dale",          email:"", rating:"",    reviews:0,   priority:"High",   status:"Customer",  acctNum:"3200",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                         relScore:"", isStocking:false, inventory:[] },
  { id:21,  name:"Ardon Brothers Tire Shop",          type:"Tire Shop",          town:"Pilot Point",  address:"1293 US-377",              fullAddress:"1293 US-377, Pilot Point, TX 76258",                phone:"(214) 586-4009", contact:"",              email:"", rating:"5.0", reviews:2,   priority:"Medium", status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Tire and repair",                          relScore:"", isStocking:false, inventory:[] },
  { id:30,  name:"Cummins Auto",                      type:"Auto Repair",        town:"Sanger",       address:"1220 FM 455 W Unit E1",    fullAddress:"1220 FM 455 W, Sanger, TX 76266",                   phone:"(940) 735-6752", contact:"",              email:"", rating:"4.5", reviews:46,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"General repair",                           relScore:"", isStocking:false, inventory:[] },
  { id:31,  name:"After Hours Motorsports",           type:"Jeep / Off-Road",    town:"Sanger",       address:"8307 FM 2164 Bldg 6",      fullAddress:"8307 FM 2164, Sanger, TX 76266",                    phone:"(940) 735-3500", contact:"",              email:"", rating:"4.9", reviews:53,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Jeep specialist",                          relScore:"", isStocking:false, inventory:[] },
  { id:32,  name:"Randy's of Sanger",                 type:"Auto Repair",        town:"Sanger",       address:"203 W Chapman Dr",         fullAddress:"203 W Chapman Dr, Sanger, TX 76266",                phone:"(940) 535-4045", contact:"",              email:"", rating:"4.5", reviews:76,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Multi-service",                            relScore:"", isStocking:false, inventory:[] },
  { id:33,  name:"Family First Automotive",           type:"Auto Repair",        town:"Sanger",       address:"300 N Stemmons St",        fullAddress:"300 N Stemmons St, Sanger, TX 76266",               phone:"(940) 458-8519", contact:"",              email:"", rating:"4.7", reviews:120, priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"General repair",                           relScore:"", isStocking:false, inventory:[] },
  { id:34,  name:"Marvin's Auto Repair",              type:"Auto Repair",        town:"Sanger",       address:"209 E Chapman Dr",         fullAddress:"209 E Chapman Dr, Sanger, TX 76266",                phone:"(940) 458-5211", contact:"",              email:"", rating:"4.9", reviews:41,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"General automotive",                       relScore:"", isStocking:false, inventory:[] },
  { id:35,  name:"City of Sanger",                    type:"Municipal Fleet",    town:"Sanger",       address:"100 Cherry St",            fullAddress:"100 Cherry St, Sanger, TX 76266",                   phone:"940-458-4721",   contact:"",              email:"", rating:"",    reviews:0,   priority:"High",   status:"Customer",  acctNum:"97",    monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Municipal fleet",                          relScore:"", isStocking:false, inventory:[] },
  { id:36,  name:"Renewal Contractors",               type:"Construction",       town:"Sanger",       address:"7139 Odum Rd",             fullAddress:"7139 Odum Rd, Sanger, TX 76266",                    phone:"972-523-4414",   contact:"",              email:"", rating:"",    reviews:0,   priority:"Medium", status:"Customer",  acctNum:"430",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                         relScore:"", isStocking:false, inventory:[] },
  { id:37,  name:"Bonet Transmission & Auto Repair",  type:"Transmission Shop",  town:"Sanger",       address:"1252 FM 455 W",            fullAddress:"1252 FM 455 W, Sanger, TX 76266",                   phone:"(940) 395-5231", contact:"",              email:"", rating:"5.0", reviews:3,   priority:"Medium", status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Transmission specialist",                  relScore:"", isStocking:false, inventory:[] },
  { id:40,  name:"Fifth Gear Automotive",             type:"Auto Repair",        town:"Cross Roads",  address:"7351 US-377",              fullAddress:"7351 US-377, Cross Roads, TX 76227",                phone:"817-540-7500",   contact:"Calvin",        email:"", rating:"4.9", reviews:668, priority:"High",   status:"Customer",  acctNum:"258",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Highest volume. Rotors for police, Mobil 1 ULV.",  relScore:"", isStocking:false, inventory:[] },
  { id:41,  name:"Big Brand Tire & Service (CR)",     type:"Tire Shop",          town:"Cross Roads",  address:"100 Naylor Rd",            fullAddress:"100 Naylor Rd, Cross Roads, TX 76227",              phone:"940-240-6828",   contact:"Brian",         email:"", rating:"4.6", reviews:600, priority:"High",   status:"Customer",  acctNum:"4014",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Stocking: filters & batteries",            relScore:"", isStocking:true,  inventory:[{id:"bb-cr-1",partNum:"21348",description:"Oil Filter",parLevel:12,currentStock:0},{id:"bb-cr-2",partNum:"78-8C",description:"Battery Grp 78",parLevel:4,currentStock:0}] },
  { id:50,  name:"Providence Automotive",             type:"Auto Repair",        town:"Aubrey",       address:"2761 FM 2931",             fullAddress:"2761 FM 2931, Aubrey, TX 76227",                    phone:"940-365-9410",   contact:"Mike/Andrew",   email:"", rating:"4.9", reviews:537, priority:"High",   status:"Customer",  acctNum:"50088", monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Large shop",                               relScore:"", isStocking:false, inventory:[] },
  { id:51,  name:"Aubrey Automotive Repair Center",   type:"Auto Repair",        town:"Aubrey",       address:"800 US-377",               fullAddress:"800 US-377, Aubrey, TX 76227",                      phone:"(940) 365-1002", contact:"",              email:"", rating:"4.8", reviews:160, priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Strong reviews",                           relScore:"", isStocking:false, inventory:[] },
  { id:52,  name:"Ultimate Auto Repair",              type:"Auto Repair",        town:"Aubrey",       address:"700 US-377",               fullAddress:"700 US-377, Aubrey, TX 76227",                      phone:"(940) 365-9997", contact:"",              email:"", rating:"4.5", reviews:111, priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Busy general",                             relScore:"", isStocking:false, inventory:[] },
  { id:53,  name:"Superhero Automotive Repairs",      type:"Auto Repair",        town:"Aubrey",       address:"9053 Ike Byrom Rd",        fullAddress:"9053 Ike Byrom Rd, Aubrey, TX 76227",               phone:"(940) 945-7987", contact:"",              email:"", rating:"4.9", reviews:48,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Excellent reviews",                        relScore:"", isStocking:false, inventory:[] },
  { id:54,  name:"GTG RV Repair & Rentals",           type:"RV Repair",          town:"Aubrey",       address:"4320 US-377",              fullAddress:"4320 US-377, Aubrey, TX 76227",                     phone:"940-334-7471",   contact:"Kristi",        email:"", rating:"4.8", reviews:66,  priority:"High",   status:"Customer",  acctNum:"245",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Great relationship — call us first.",      relScore:"", isStocking:false, inventory:[] },
  { id:55,  name:"AntiMatter Performance",            type:"Performance",        town:"Aubrey",       address:"2601 Wheeler Ave",         fullAddress:"2601 Wheeler Ave, Aubrey, TX 76227",                phone:"(972) 342-8871", contact:"",              email:"", rating:"5.0", reviews:87,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Performance",                              relScore:"", isStocking:false, inventory:[] },
  { id:56,  name:"Stett's Diesel Trucks",             type:"Diesel Truck",       town:"Aubrey",       address:"2160 Rockhill Rd",         fullAddress:"2160 Rockhill Rd, Aubrey, TX 76227",                phone:"(972) 423-3310", contact:"",              email:"", rating:"5.0", reviews:45,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Diesel trucks",                            relScore:"", isStocking:false, inventory:[] },
  { id:57,  name:"428Auto",                           type:"Auto Repair",        town:"Aubrey",       address:"110 N Sherman Dr",         fullAddress:"110 N Sherman Dr, Aubrey, TX 76227",                phone:"469-779-5195",   contact:"",              email:"", rating:"4.1", reviews:14,  priority:"Medium", status:"Customer",  acctNum:"278",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Smaller shop",                             relScore:"", isStocking:false, inventory:[] },
  { id:58,  name:"DFW Luxury Automotive Group",       type:"Auto Repair",        town:"Aubrey",       address:"1518 Navo Rd Suite B-01",  fullAddress:"1518 Navo Rd, Aubrey, TX 76227",                    phone:"(214) 404-2881", contact:"",              email:"", rating:"4.9", reviews:163, priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Luxury automotive",                        relScore:"", isStocking:false, inventory:[] },
  { id:59,  name:"Brad's Automotive (Aubrey)",        type:"Auto Repair",        town:"Aubrey",       address:"210 S Hwy 377",            fullAddress:"210 S Hwy 377, Aubrey, TX 76227",                   phone:"940-365-9006",   contact:"Brad",          email:"", rating:"4.9", reviews:44,  priority:"High",   status:"Customer",  acctNum:"273",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"General repair",                           relScore:"", isStocking:false, inventory:[] },
  { id:60,  name:"Frank Bartel Transportation",       type:"Trucking",           town:"Aubrey",       address:"7401 US-377",              fullAddress:"7401 US-377, Aubrey, TX 76227",                     phone:"940-440-3230",   contact:"Miguel",        email:"", rating:"4.5", reviews:22,  priority:"High",   status:"Customer",  acctNum:"1635",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Heavy trucking. Stocking account.",        relScore:"", isStocking:true,  inventory:[{id:"fbt-1",partNum:"21348",description:"Oil Filter",parLevel:6,currentStock:0},{id:"fbt-2",partNum:"LF-9080",description:"HD Oil Filter",parLevel:4,currentStock:0}] },
  { id:61,  name:"Moss Performance",                  type:"ATV Repair",         town:"Aubrey",       address:"2576 FM 455",              fullAddress:"2576 FM 455, Aubrey, TX 76227",                     phone:"702-441-5851",   contact:"",              email:"", rating:"4.4", reviews:55,  priority:"Medium", status:"Customer",  acctNum:"246",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"ATV / powersports",                        relScore:"", isStocking:false, inventory:[] },
  { id:62,  name:"Big Brand Tire & Service (SAV)",    type:"Tire Shop",          town:"Aubrey",       address:"26779 US-380",             fullAddress:"26779 US-380, Aubrey, TX 76227",                    phone:"469-715-0028",   contact:"Danny",         email:"", rating:"4.6", reviews:600, priority:"High",   status:"Customer",  acctNum:"4015",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Stocking: filters & batteries",            relScore:"", isStocking:true,  inventory:[{id:"bb-sav-1",partNum:"21348",description:"Oil Filter",parLevel:12,currentStock:0},{id:"bb-sav-2",partNum:"78-8C",description:"Battery Grp 78",parLevel:4,currentStock:0}] },
  { id:63,  name:"RTEL Construction",                 type:"Construction",       town:"Aubrey",       address:"8291 FM 2931",             fullAddress:"8291 FM 2931, Aubrey, TX 76227",                    phone:"940-365-0895",   contact:"",              email:"", rating:"",    reviews:0,   priority:"Medium", status:"Customer",  acctNum:"159",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                         relScore:"", isStocking:false, inventory:[] },
  { id:64,  name:"BSP Motorsports LLC",               type:"Performance",        town:"Aubrey",       address:"14546 Industrial Park",    fullAddress:"14546 Industrial Park, Aubrey, TX 76227",           phone:"(469) 731-5887", contact:"",              email:"", rating:"4.9", reviews:208, priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Performance",                              relScore:"", isStocking:false, inventory:[] },
  { id:70,  name:"Xclusive Truck Kustoms",            type:"Truck Accessories",  town:"Celina",       address:"200 S Louisiana Dr #120",  fullAddress:"200 S Louisiana Dr, Celina, TX 75009",             phone:"(214) 687-2703", contact:"",              email:"", rating:"4.7", reviews:171, priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Truck custom",                             relScore:"", isStocking:false, inventory:[] },
  { id:71,  name:"Celina Diesel",                     type:"Diesel Repair",      town:"Celina",       address:"11187 Co Rd 95",           fullAddress:"11187 Co Rd 95, Celina, TX 75009",                  phone:"(469) 502-3550", contact:"",              email:"", rating:"5.0", reviews:22,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Diesel specialist",                        relScore:"", isStocking:false, inventory:[] },
  { id:72,  name:"RX Collision Celina",               type:"Auto Body",          town:"Celina",       address:"112 W Ash St",             fullAddress:"112 W Ash St, Celina, TX 75009",                    phone:"(972) 382-3040", contact:"",              email:"", rating:"4.9", reviews:40,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Collision",                                relScore:"", isStocking:false, inventory:[] },
  { id:73,  name:"D & V Auto Repair",                 type:"Auto Repair",        town:"Celina",       address:"106 N Louisiana Dr",       fullAddress:"106 N Louisiana Dr, Celina, TX 75009",             phone:"972-382-3601",   contact:"",              email:"", rating:"4.5", reviews:156, priority:"Medium", status:"Customer",  acctNum:"1620",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"General",                                  relScore:"", isStocking:false, inventory:[] },
  { id:74,  name:"FCS Construction LLC",              type:"Construction Fleet", town:"Celina",       address:"1490 N Louisiana Dr",      fullAddress:"1490 N Louisiana Dr, Celina, TX 75009",            phone:"214-551-2348",   contact:"Sean/Barry",    email:"", rating:"4.6", reviews:8,   priority:"High",   status:"Customer",  acctNum:"2800",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Construction fleet",                       relScore:"", isStocking:false, inventory:[] },
  { id:75,  name:"Dickerson Construction Co",         type:"Construction Fleet", town:"Celina",       address:"1130 N Louisiana Dr",      fullAddress:"1130 N Louisiana Dr, Celina, TX 75009",            phone:"972-382-2123",   contact:"Devin/Blake",   email:"", rating:"3.3", reviews:6,   priority:"Medium", status:"Customer",  acctNum:"28",    monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Will call if needed.",                      relScore:"", isStocking:false, inventory:[] },
  { id:76,  name:"1876 Country Club",                 type:"Golf / Fleet",       town:"Celina",       address:"3500 N Legacy Dr",         fullAddress:"3500 N Legacy Dr, Celina, TX 75009",               phone:"214-497-1097",   contact:"",              email:"", rating:"",    reviews:0,   priority:"Medium", status:"Customer",  acctNum:"287",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                         relScore:"", isStocking:false, inventory:[] },
  { id:80,  name:"Hickman Creations",                 type:"Auto Restoration",   town:"Gunter",       address:"424 W Main St",            fullAddress:"424 W Main St, Gunter, TX 75058",                   phone:"(903) 228-5014", contact:"",              email:"", rating:"4.0", reviews:21,  priority:"Medium", status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Classic cars",                             relScore:"", isStocking:false, inventory:[] },
  { id:81,  name:"Rushton Automotive",                type:"Auto Repair",        town:"Gunter",       address:"424 W Main St Suite 6",    fullAddress:"424 W Main St, Gunter, TX 75058",                   phone:"(972) 433-3972", contact:"",              email:"", rating:"5.0", reviews:10,  priority:"Medium", status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Small repair",                             relScore:"", isStocking:false, inventory:[] },
  { id:82,  name:"Mario Jr Tire Service",             type:"Tire Shop",          town:"Gunter",       address:"341 Stiff Chapel Rd",      fullAddress:"341 Stiff Chapel Rd, Gunter, TX 75058",             phone:"903-816-1459",   contact:"Mario",         email:"", rating:"",    reviews:0,   priority:"High",   status:"Customer",  acctNum:"64",    monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                         relScore:"", isStocking:false, inventory:[] },
  { id:90,  name:"Three Seventy Seven Tires",         type:"Tire & Oil",         town:"Collinsville", address:"719 US-377",               fullAddress:"719 US-377, Collinsville, TX 76233",                phone:"(903) 429-3425", contact:"",              email:"", rating:"4.6", reviews:66,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Tires + oil",                              relScore:"", isStocking:false, inventory:[] },
  { id:91,  name:"Collinsville Tire Shop",            type:"Tire Shop",          town:"Collinsville", address:"9415 US-377",              fullAddress:"9415 US-377, Collinsville, TX 76233",               phone:"(214) 549-7306", contact:"",              email:"", rating:"5.0", reviews:72,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Tire shop",                                relScore:"", isStocking:false, inventory:[] },
  { id:92,  name:"Brad's Automotive (Collinsville)",  type:"Auto Repair",        town:"Collinsville", address:"2118 Dawkins Rd",          fullAddress:"2118 Dawkins Rd, Collinsville, TX 76233",           phone:"(903) 429-6022", contact:"",              email:"", rating:"4.9", reviews:21,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"General repair",                           relScore:"", isStocking:false, inventory:[] },
  { id:93,  name:"Jesse Buttress Sand & Gravel",      type:"Construction",       town:"Collinsville", address:"182 Cobler Rd",            fullAddress:"182 Cobler Rd, Collinsville, TX 76233",             phone:"214-243-7676",   contact:"Jesse",         email:"", rating:"",    reviews:0,   priority:"Medium", status:"Customer",  acctNum:"239",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                         relScore:"", isStocking:false, inventory:[] },
  { id:100, name:"Myrt's Paint & Body",               type:"Auto Body",          town:"Tioga",        address:"211 S Donaton St",         fullAddress:"211 S Donaton St, Tioga, TX 76271",                 phone:"(903) 815-5959", contact:"",              email:"", rating:"5.0", reviews:9,   priority:"Medium", status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Body shop",                                relScore:"", isStocking:false, inventory:[] },
  { id:101, name:"USA Trucking Inc",                  type:"Trucking",           town:"Tioga",        address:"616 Bodovsky Rd",          fullAddress:"616 Bodovsky Rd, Tioga, TX 76271",                  phone:"940-437-5222",   contact:"",              email:"", rating:"3.3", reviews:7,   priority:"Medium", status:"Customer",  acctNum:"1280",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Bulk hauling",                             relScore:"", isStocking:false, inventory:[] },
  { id:110, name:"BURNCO Ready-Mix",                  type:"Ready Mix Concrete", town:"Krugerville",  address:"9170 Ike Byrom Rd",        fullAddress:"9170 Ike Byrom Rd, Aubrey, TX 76227",               phone:"469-647-3604",   contact:"Bryant/Roberts",email:"", rating:"4.7", reviews:6,   priority:"High",   status:"Customer",  acctNum:"2560",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Interested in Milwaukee tools.",            relScore:"", isStocking:false, inventory:[] },
  { id:111, name:"Nuts and Volts Automotive",         type:"Auto Repair",        town:"Krugerville",  address:"4900 US-377",              fullAddress:"4900 US-377, Krugerville, TX 76227",                phone:"972-505-6132",   contact:"Tess/Ryan",     email:"", rating:"4.9", reviews:29,  priority:"High",   status:"Customer",  acctNum:"267",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Call us first — excellent relationship.",  relScore:"", isStocking:false, inventory:[] },
  { id:112, name:"META COLLISION",                    type:"Auto Body",          town:"Krugerville",  address:"8171 US-377",              fullAddress:"8171 US-377, Krugerville, TX 76227",                phone:"(214) 783-9466", contact:"",              email:"", rating:"5.0", reviews:50,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Collision center",                         relScore:"", isStocking:false, inventory:[] },
  { id:113, name:"A-Z Bus Sales",                     type:"Fleet / Bus",        town:"Krugerville",  address:"1003 Prosperity Way",      fullAddress:"1003 Prosperity Way, Krugerville, TX 76227",        phone:"214-693-5299",   contact:"Michael/Ashley",email:"", rating:"",    reviews:0,   priority:"High",   status:"Customer",  acctNum:"238",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"AP dept follow-up. Good relationship.",   relScore:"", isStocking:false, inventory:[] },
  { id:120, name:"Abilene Diesel Performance DFW",    type:"Diesel Repair",      town:"Valley View",  address:"6444 E Lone Oak Rd",       fullAddress:"6444 E Lone Oak Rd, Valley View, TX 76272",         phone:"940-580-0646",   contact:"Eric/Courtney", email:"", rating:"5.0", reviews:44,  priority:"High",   status:"Customer",  acctNum:"316",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Diesel performance",                       relScore:"", isStocking:false, inventory:[] },
  { id:130, name:"Big Brand Tire & Service (Sherman)",type:"Tire Shop",          town:"Sherman",      address:"4001 Texoma Pkwy",         fullAddress:"4001 Texoma Pkwy, Sherman, TX 75090",               phone:"903-868-8072",   contact:"Mark",          email:"", rating:"",    reviews:0,   priority:"High",   status:"Customer",  acctNum:"4016",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Stocking: filters & batteries",            relScore:"", isStocking:true,  inventory:[{id:"bb-sh-1",partNum:"21348",description:"Oil Filter",parLevel:12,currentStock:0},{id:"bb-sh-2",partNum:"78-8C",description:"Battery Grp 78",parLevel:4,currentStock:0}] },
];

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const STATUSES   = ["","Customer","Active","Prospect","Warm Lead","Cold","Not Interested"];
const PRIORITIES = ["High","Medium","Low"];
const ALL_TOWNS  = ["All Towns",...Array.from(new Set(INITIAL_CUSTOMERS.map(c=>c.town))).sort()];

const priorityConfig = {
  High:   {bg:"#fee2e2",text:"#991b1b",dot:"#ef4444"},
  Medium: {bg:"#fef3c7",text:"#92400e",dot:"#f59e0b"},
  Low:    {bg:"#dbeafe",text:"#1e40af",dot:"#3b82f6"},
};
const statusColors = {
  Customer:"#16a34a",Active:"#0891b2","Warm Lead":"#d97706",
  Prospect:"#7c3aed",Cold:"#9ca3af","Not Interested":"#dc2626","":"#9ca3af"
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

const mapsUrl = addr=>`https://maps.google.com/?q=${encodeURIComponent(addr)}`;
function multiStopMapsUrl(stops){
  if(!stops.length)return"#";
  if(stops.length===1)return mapsUrl(stops[0].fullAddress);
  const e=s=>encodeURIComponent(s);
  const o=e(stops[0].fullAddress),d=e(stops[stops.length-1].fullAddress);
  const w=stops.slice(1,-1).map(s=>e(s.fullAddress)).join("|");
  return`https://www.google.com/maps/dir/?api=1&origin=${o}&destination=${d}${w?`&waypoints=${w}`:""}&travelmode=driving`;
}

const today = ()=>new Date().toISOString().split("T")[0];
const formatDate = d=>{ if(!d)return""; const dt=new Date(d+"T12:00:00"); return dt.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}); };
const daysUntil = d=>{ if(!d)return null; const diff=new Date(d+"T12:00:00")-new Date(); return Math.ceil(diff/(1000*60*60*24)); };

// ─── STYLES ───────────────────────────────────────────────────────────────────
const inp  = {width:"100%",border:"1.5px solid #d1d5db",borderRadius:8,padding:"8px 10px",fontSize:13,color:"#1f2937",boxSizing:"border-box",background:"#fff"};
const sel  = {border:"1.5px solid #e2e8f0",borderRadius:8,padding:"8px 10px",fontSize:13,color:"#1f2937",background:"#fff",cursor:"pointer"};
const lbl  = {display:"block",fontSize:11,fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4};
const btn  = (bg,color="#fff")=>({padding:"9px 18px",background:bg,border:"none",borderRadius:8,color,fontWeight:700,cursor:"pointer",fontSize:13});

// ─── ATOMS ────────────────────────────────────────────────────────────────────
function PriBadge({p}){const c=priorityConfig[p]||{bg:"#f3f4f6",text:"#374151",dot:"#9ca3af"};return<span style={{background:c.bg,color:c.text,padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700,display:"inline-flex",alignItems:"center",gap:4}}><span style={{width:6,height:6,borderRadius:"50%",background:c.dot,display:"inline-block"}}/>{p}</span>;}
function StsBadge({s}){const color=statusColors[s]||"#9ca3af";return<span style={{background:color+"22",color,border:`1px solid ${color}44`,padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700}}>{s||"Unset"}</span>;}
function SpendBadge({spend}){const t=getSpendTier(spend);return<span style={{background:t.bg,color:t.color,padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700,display:"inline-flex",alignItems:"center",gap:4}}><span style={{width:6,height:6,borderRadius:"50%",background:t.dot,display:"inline-block"}}/>{t.label}</span>;}
function AddrLink({addr,style={}}){if(!addr)return<span style={{color:"#9ca3af"}}>—</span>;return<a href={mapsUrl(addr)} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{color:"#2563eb",fontSize:13,fontWeight:500,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:3,...style}} onMouseEnter={e=>e.currentTarget.style.textDecoration="underline"} onMouseLeave={e=>e.currentTarget.style.textDecoration="none"}>📍 {addr}</a>;}
function Fld({label,children}){return<div><label style={lbl}>{label}</label>{children}</div>;}

// ─── NAPA LOGO ────────────────────────────────────────────────────────────────
function NapaLogo(){
  return(
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <img src="data:image/png;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAE4KADAAQAAAABAAAB7gAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/8AAEQgB7gTgAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMAAQEBAQEBAgEBAgMCAgIDBAMDAwMEBgQEBAQEBgcGBgYGBgYHBwcHBwcHBwgICAgICAkJCQkJCwsLCwsLCwsLC//bAEMBAgICAwMDBQMDBQsIBggLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLC//dAAQATv/aAAwDAQACEQMRAD8A/wA/+iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP//Q/wA/+iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP//R/wA/+iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP//S/wA/+iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP//T/wA/+iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP//U/wA/+iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP//V/wA/+iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP//W/wA/+iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAorf8J+FfEnjrxTpvgjwbYzanq+s3UNjY2duhkmuLm4cRxRRqOWd3YKoHJJxX+gj/wS1/4IM/AT9kbwxpfxY/aS0uz8c/FGeOC6Zb6NLjTtEmAD+VaxEvHJNG+M3ThmDIDCIxuL/E8bceZbwxhY18a3Kcr8kI/FJrfySXVv5Xdke1kuRYnM6rhR0it5PZf5vsj+Fn4d/sgftafF/wAPJ4t+E3wu8XeKNKkJCXukaJeXtuxBIOJIYnQ8gjrXef8ADuz/AIKB/wDRCviF/wCExqX/AMj1/q8gBQFUYApa/Ban0kcW5P2eXRS6XqNv/wBJX5H3UfDqlb3sQ7/4V/mf5Qv/AA7s/wCCgf8A0Qr4hf8AhMal/wDI9H/Duz/goH/0Qr4hf+ExqX/yPX+r1RUf8TIY7/oXw/8AA5f5Ff8AEO6H/P8Af3L/ADP8oX/h3Z/wUD/6IV8Qv/CY1L/5Ho/4d2f8FA/+iFfEL/wmNS/+R6/1eqKP+JkMd/0L4f8Agcv8g/4h3Q/5/v7l/mf5Qv8Aw7s/4KB/9EK+IX/hMal/8j0f8O7P+Cgf/RCviF/4TGpf/I9f6vVFH/EyGO/6F8P/AAOX+Qf8Q7of8/39y/zP8oX/AId2f8FA/wDohXxC/wDCY1L/AOR6P+Hdn/BQP/ohXxC/8JjUv/kev9Xqij/iZDHf9C+H/gcv8g/4h3Q/5/v7l/mf5Qv/AA7s/wCCgf8A0Qr4hf8AhMal/wDI9H/Duz/goH/0Qr4h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hG9VZgkgeMsShr5Kr/QO/wCDi/8A4J9r+0x+zEv7T/w8sfN8a/CyCS4uBEo8y80Enfcxk4BJtTm5jy2FQTAAs4r/AD8a/wBCfDrjCHEeS0sa2vax92ou01u/SStJetujPwHiHKJZdjJUfsPWL8n/AJbMKKKK+7PDCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//0f8AP/ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACpIopZ5VhhUu7kKqqMkk9ABUdf0Vf8G6v/BPp/2nf2oD+0x8Q7EyeCfhZPFdQCQHy7zXeHtYhxhltgPtEmGyGEKspWQ14vEWe4bJsur5li37lNX9Xsorzk7JebO3L8DUxmIhhqW8n93d/Jan9Tv/AARZ/wCCfcX7An7H1hpXi6yWD4geNfK1nxO7Kvmwysn+j2JYAEraRsVKlnUTvMyHa4r9eaKK/wA588znE5tj62Y4t3qVJNvy7JeSVkvJH9C4LB08LQhh6S92Kt/wfV7sKKKK8k6gooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAjmhhuYXt7hBJHICrKwyGB4IIPUGv8y//gs3/wAE/bj9gL9sLUvD/hazaLwD4w8zWfC8gDmOK3dv31luYHL2kh2Ab3byWidzufFf6alfl1/wV3/YFsf+Cgv7H2r/AA60SGIeNdAJ1jwvcuAD9ugU7rYsWTEd3HuhOW2K5SRg3lgV+q+EfG3+r+dRjXlbDVrQn2X8s/8At1vX+65eR8vxZkv1/Bt01+8hrHz7r5/mkf5glFXNR07UNH1CfSdWgktbq1kaGaGZSkkciEqysrAFWUgggjINU6/vM/CwooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoooo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oooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/1P8AP/ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD6W/Y9/ah8e/sZftI+FP2kfhz+8v/DV4JZLVm2JeWsgMdxbOSrbVmhZ4920lCQy/MoNf6rHwR+Mvw//AGhvhH4d+N/wsvV1Dw/4osYdQsphjd5coyUcAnbJG2UkQnKOrKeQa/yEa/ry/wCDZD/goK+heJdS/wCCfXxNvj9j1Yzav4QeUkiO6RTJeWYJJAWVFNxGoCqHSbJLSKK/CPHTgn+1MsWb4WN6+HTvbeVPd/8AgD95eXN3PueCM6+rYn6pVfuVNvKXT79vWx/adRRRX8XH7GFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFfJH7c37XfgT9hr9mHxR+0d47Mcw0a2KadYPJ5TahqU2VtrVDhm/eSY3sqsY4w8hBVDXXgMDXxuJp4TDR5qk2oxS6tuyMq9eFGnKrUdoxV2/JH8z/wDwc5/8FBUittO/4J5fDS+Vml+z6z4xaJslVBEtjYtg8EnbdyKyg4FuVOCwr+Nau++KnxQ8c/Gv4k678XPibfvqniDxJfTajqF04CmSedi7EKoCquThVUBVUBVAAArga/0U4L4XocP5RRyyjq4q8n/NN/FL79F2SS6H8+Zzmc8fi54mez2XZLZf5+YUUUV9SeWFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH//V/wA/+iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKA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TurSjLWMldOztZ7pNNNNNJppoylFSVmejRfYoDdtqV/BLb3bF3jjBZtxOcqOx/P3rktb1UatdiSJPLhjUJEnoorGor1c34rrY3CrBU6ap073dnKUpauSTlJt8qlJtRVldtu7syY00ncKKKK+UNAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/1/8AP/ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//0P8AP/ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//0f8AP/ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//0v8AP/ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//0/8AP/ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//1P8AP/ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//1f8AP/ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//2Q==" alt="NAPA Auto Parts" style={{height:36,width:"auto",objectFit:"contain",filter:"brightness(0) invert(1)"}}/>
      <div style={{color:"#64748b",fontSize:11,fontWeight:500,borderLeft:"1px solid #334155",paddingLeft:10}}>North Texas<br/>Sales Territory</div>
    </div>
  );
}

// ─── INVENTORY PANEL ──────────────────────────────────────────────────────────
function InvPanel({customer,onUpdate}){
  const [items,setItems]=useState(customer.inventory||[]);
  const [np,setNp]=useState({partNum:"",description:"",parLevel:"",currentStock:""});
  const save=upd=>{setItems(upd);onUpdate({...customer,inventory:upd});};
  const add=()=>{if(!np.description)return;save([...items,{id:`inv-${Date.now()}`,partNum:np.partNum,description:np.description,parLevel:parseInt(np.parLevel)||0,currentStock:parseInt(np.currentStock)||0}]);setNp({partNum:"",description:"",parLevel:"",currentStock:""});};
  const updateStock=(id,val)=>save(items.map(i=>i.id===id?{...i,currentStock:parseInt(val)||0}:i));
  const remove=id=>save(items.filter(i=>i.id!==id));
  const reorders=items.filter(i=>i.currentStock<i.parLevel);
  return(
    <div style={{marginTop:14,padding:14,background:"#f8fafc",borderRadius:10,border:"1.5px solid #e2e8f0"}}>
      <div style={{fontWeight:800,fontSize:13,color:"#1e293b",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        📦 Inventory
        {reorders.length>0&&<span style={{background:"#fee2e2",color:"#991b1b",padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700}}>⚠️ {reorders.length} to reorder</span>}
      </div>
      {items.length>0&&(<table style={{width:"100%",borderCollapse:"collapse",marginBottom:10,fontSize:12}}>
        <thead><tr style={{background:"#e2e8f0"}}>{["Part #","Description","Par","Stock","Status",""].map(h=><th key={h} style={{padding:"5px 7px",textAlign:"left",fontWeight:700,color:"#374151"}}>{h}</th>)}</tr></thead>
        <tbody>{items.map(item=>{const low=item.currentStock<item.parLevel;return<tr key={item.id} style={{background:low?"#fff7ed":"#fff",borderBottom:"1px solid #f1f5f9"}}>
          <td style={{padding:"5px 7px",color:"#64748b"}}>{item.partNum||"—"}</td>
          <td style={{padding:"5px 7px",fontWeight:600,color:"#1f2937"}}>{item.description}</td>
          <td style={{padding:"5px 7px",color:"#64748b"}}>{item.parLevel}</td>
          <td style={{padding:"5px 7px"}}><input type="number" value={item.currentStock} onChange={e=>updateStock(item.id,e.target.value)} style={{width:52,border:"1.5px solid #d1d5db",borderRadius:6,padding:"2px 5px",fontSize:12,textAlign:"center"}}/></td>
          <td style={{padding:"5px 7px"}}>{low?<span style={{color:"#dc2626",fontWeight:700,fontSize:11}}>🔴 REORDER</span>:<span style={{color:"#16a34a",fontWeight:700,fontSize:11}}>✅ OK</span>}</td>
          <td style={{padding:"5px 7px"}}><button onClick={()=>remove(item.id)} style={{background:"none",border:"none",color:"#dc2626",cursor:"pointer",fontSize:14,fontWeight:700}}>×</button></td>
        </tr>;})}</tbody>
      </table>)}
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

// ─── INVENTORY PRINT / PDF ────────────────────────────────────────────────────
function InvPrintModal({customers,onClose}){
  const accts=customers.filter(c=>c.isStocking);
  const allItems=accts.flatMap(c=>(c.inventory||[]).map(i=>({...i,cName:c.name,cTown:c.town,cPhone:c.phone,cContact:c.contact,cAcct:c.acctNum})));
  const reorderItems=allItems.filter(i=>i.currentStock<i.parLevel);

  const doPrint=()=>{
    const w=window.open("","_blank","width=900,height=700");
    const rows=reorderItems.map(i=>`
      <tr>
        <td>${i.cName}</td><td>${i.cTown}</td><td>${i.cAcct||"—"}</td>
        <td>${i.cContact||"—"}</td><td>${i.cPhone||"—"}</td>
        <td><strong>${i.partNum||"—"}</strong></td><td>${i.description}</td>
        <td style="text-align:center">${i.parLevel}</td>
        <td style="text-align:center;color:#dc2626;font-weight:700">${i.currentStock}</td>
        <td style="text-align:center;font-weight:700;color:#16a34a">${i.parLevel-i.currentStock}</td>
      </tr>`).join("");
    w.document.write(`<!DOCTYPE html><html><head><title>NAPA Reorder Sheet</title>
    <style>
      body{font-family:Arial,sans-serif;padding:24px;color:#1e293b;}
      .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #cc0000;}
      .logo{background:#cc0000;color:white;font-weight:900;font-size:24px;padding:6px 14px;border-radius:4px;letter-spacing:1px;}
      h2{margin:0 0 4px;font-size:18px;}
      .meta{font-size:13px;color:#64748b;}
      table{width:100%;border-collapse:collapse;font-size:12px;}
      th{background:#1e293b;color:white;padding:8px 10px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;}
      td{padding:8px 10px;border-bottom:1px solid #e2e8f0;}
      tr:nth-child(even) td{background:#f8fafc;}
      .footer{margin-top:20px;font-size:11px;color:#94a3b8;text-align:center;}
      @media print{button{display:none;}}
    </style></head><body>
    <div class="header">
      <div><div class="logo">NAPA</div></div>
      <div style="text-align:right">
        <h2>Stocking Account Reorder Sheet</h2>
        <div class="meta">NAPA Auto Parts — North Texas Territory</div>
        <div class="meta">Generated: ${new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
        <div class="meta" style="margin-top:4px;color:#dc2626;font-weight:700">${reorderItems.length} item${reorderItems.length!==1?"s":""} need reorder</div>
      </div>
    </div>
    ${reorderItems.length===0?`<div style="text-align:center;padding:40px;color:#16a34a;font-size:18px;font-weight:700">✅ All stocking accounts are fully stocked — no reorders needed!</div>`:`
    <table>
      <thead><tr>
        <th>Account</th><th>Town</th><th>Acct #</th><th>Contact</th><th>Phone</th>
        <th>Part #</th><th>Description</th><th>Par</th><th>In Stock</th><th>Order Qty</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`}
    <div class="footer">NAPA Auto Parts · North Texas Sales Territory · Pull this sheet to fulfill stocking orders</div>
    <br/><button onclick="window.print()" style="padding:10px 24px;background:#cc0000;color:white;border:none;border-radius:6px;font-size:14px;font-weight:700;cursor:pointer;margin-right:10px">🖨️ Print / Save as PDF</button>
    <button onclick="window.close()" style="padding:10px 24px;background:#64748b;color:white;border:none;border-radius:6px;font-size:14px;font-weight:700;cursor:pointer">Close</button>
    </body></html>`);
    w.document.close();
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:560,boxShadow:"0 24px 60px rgba(0,0,0,0.3)"}}>
        <div style={{background:"#1e293b",padding:"18px 24px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{color:"#fff",fontWeight:800,fontSize:16}}>🖨️ Inventory Reorder Sheet</div>
          <button onClick={onClose} style={{color:"#94a3b8",background:"none",border:"none",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{padding:24}}>
          <div style={{marginBottom:16,padding:14,background:"#f8fafc",borderRadius:10,border:"1.5px solid #e2e8f0"}}>
            <div style={{fontWeight:700,fontSize:13,color:"#1e293b",marginBottom:8}}>What this generates:</div>
            <div style={{fontSize:13,color:"#475569",lineHeight:1.7}}>
              ✅ A clean printable sheet with all items needing reorder<br/>
              ✅ Account name, number, contact, and phone for each location<br/>
              ✅ Part numbers, descriptions, par levels, and order quantities<br/>
              ✅ Print it or save as PDF to email to the store
            </div>
          </div>
          <div style={{padding:14,background:reorderItems.length>0?"#fff7ed":"#f0fdf4",borderRadius:10,border:`1.5px solid ${reorderItems.length>0?"#fed7aa":"#bbf7d0"}`,marginBottom:20,textAlign:"center"}}>
            {reorderItems.length>0
              ?<div style={{fontWeight:700,color:"#c2410c",fontSize:14}}>⚠️ {reorderItems.length} item{reorderItems.length!==1?"s":""} across {accts.filter(c=>(c.inventory||[]).some(i=>i.currentStock<i.parLevel)).length} account{accts.filter(c=>(c.inventory||[]).some(i=>i.currentStock<i.parLevel)).length!==1?"s":""} need reorder</div>
              :<div style={{fontWeight:700,color:"#16a34a",fontSize:14}}>✅ All accounts fully stocked</div>}
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button onClick={onClose} style={{...btn("#f1f5f9","#374151"),border:"1.5px solid #d1d5db"}}>Cancel</button>
            <button onClick={doPrint} style={btn("#cc0000")}>🖨️ Open Print / PDF Sheet</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── INVENTORY DASHBOARD ──────────────────────────────────────────────────────
function InvDash({customers,onUpdate,onClose,onPrint}){
  const accts=customers.filter(c=>c.isStocking);
  const alerts=accts.flatMap(c=>(c.inventory||[]).filter(i=>i.currentStock<i.parLevel).map(i=>({...i,cName:c.name,cTown:c.town})));
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:780,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,0.3)"}}>
        <div style={{background:"#1e293b",padding:"20px 24px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{color:"#fff",fontWeight:800,fontSize:18}}>📦 Stocking Account Inventory</div>
            <div style={{color:"#64748b",fontSize:12,marginTop:2}}>{accts.length} stocking accounts · {alerts.length} items need reorder</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={onPrint} style={{...btn("#cc0000"),fontSize:12}}>🖨️ Print / PDF</button>
            <button onClick={onClose} style={{color:"#94a3b8",background:"none",border:"none",fontSize:22,cursor:"pointer"}}>✕</button>
          </div>
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

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({customers,onClose,onSelectCustomer}){
  const activeCustomers=customers.filter(c=>c.status==="Customer"||c.status==="Active");
  const totalSpend=activeCustomers.reduce((sum,c)=>sum+(parseFloat(c.monthlySpend)||0),0);
  const topAccounts=[...activeCustomers].sort((a,b)=>(parseFloat(b.monthlySpend)||0)-(parseFloat(a.monthlySpend)||0)).slice(0,10);
  const openFollowups=customers.filter(c=>c.nextFollowUp).sort((a,b)=>a.nextFollowUp<b.nextFollowUp?-1:1);
  const reorderCount=customers.filter(c=>c.isStocking).flatMap(c=>(c.inventory||[]).filter(i=>i.currentStock<i.parLevel)).length;
  const prospectCount=customers.filter(c=>c.status==="Prospect"||!c.status).length;
  const byTown=ALL_TOWNS.filter(t=>t!=="All Towns").map(t=>({town:t,count:customers.filter(c=>c.town===t).length,customers:customers.filter(c=>c.town===t&&(c.status==="Customer"||c.status==="Active")).length})).sort((a,b)=>b.count-a.count);

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:860,maxHeight:"93vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,0.3)"}}>
        <div style={{background:"#1e293b",padding:"20px 24px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{color:"#fff",fontWeight:800,fontSize:18}}>📊 Territory Dashboard</div><div style={{color:"#64748b",fontSize:12,marginTop:2}}>North Texas Sales Territory Overview</div></div>
          <button onClick={onClose} style={{color:"#94a3b8",background:"none",border:"none",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{padding:24}}>
          {/* KPI row */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:24}}>
            {[
              {label:"Total Accounts",value:customers.length,icon:"🏢",color:"#1e293b"},
              {label:"Active Customers",value:activeCustomers.length,icon:"✅",color:"#16a34a"},
              {label:"Monthly Spend",value:`$${totalSpend.toLocaleString()}`,icon:"💰",color:"#0891b2"},
              {label:"Open Follow-Ups",value:openFollowups.length,icon:"📅",color:"#d97706"},
              {label:"Reorders Needed",value:reorderCount,icon:"🔴",color:reorderCount>0?"#dc2626":"#16a34a"},
            ].map(k=>(
              <div key={k.label} style={{background:"#f8fafc",borderRadius:12,padding:"16px 14px",textAlign:"center",border:"1.5px solid #e2e8f0"}}>
                <div style={{fontSize:24,marginBottom:4}}>{k.icon}</div>
                <div style={{fontWeight:900,fontSize:22,color:k.color,lineHeight:1}}>{k.value}</div>
                <div style={{fontSize:11,color:"#64748b",fontWeight:600,marginTop:4,textTransform:"uppercase",letterSpacing:"0.04em"}}>{k.label}</div>
              </div>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>
            {/* Top accounts */}
            <div style={{border:"1.5px solid #e2e8f0",borderRadius:12,overflow:"hidden"}}>
              <div style={{background:"#f8fafc",padding:"12px 16px",fontWeight:800,fontSize:13,color:"#1e293b",borderBottom:"1px solid #e2e8f0"}}>💰 Top Accounts by Monthly Spend</div>
              {topAccounts.length===0&&<div style={{padding:20,color:"#94a3b8",fontSize:13,textAlign:"center"}}>No spend data yet — add monthly spend amounts to customers</div>}
              {topAccounts.map((c,i)=>(
                <div key={c.id} onClick={()=>{onClose();onSelectCustomer(c);}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 16px",borderBottom:"1px solid #f1f5f9",cursor:"pointer",background:"#fff"}} onMouseEnter={e=>e.currentTarget.style.background="#f0f9ff"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontWeight:800,fontSize:12,color:"#94a3b8",minWidth:18}}>#{i+1}</span>
                    <div>
                      <div style={{fontWeight:700,fontSize:13,color:"#1e293b"}}>{c.name}</div>
                      <div style={{fontSize:11,color:"#64748b"}}>{c.town}</div>
                    </div>
                  </div>
                  <SpendBadge spend={c.monthlySpend}/>
                </div>
              ))}
            </div>

            {/* Open follow-ups */}
            <div style={{border:"1.5px solid #e2e8f0",borderRadius:12,overflow:"hidden"}}>
              <div style={{background:"#f8fafc",padding:"12px 16px",fontWeight:800,fontSize:13,color:"#1e293b",borderBottom:"1px solid #e2e8f0"}}>📅 Upcoming Follow-Ups</div>
              {openFollowups.length===0&&<div style={{padding:20,color:"#94a3b8",fontSize:13,textAlign:"center"}}>No follow-ups scheduled — add them in customer profiles</div>}
              {openFollowups.slice(0,8).map(c=>{
                const days=daysUntil(c.nextFollowUp);
                const urgent=days!==null&&days<=3;
                const overdue=days!==null&&days<0;
                return<div key={c.id} onClick={()=>{onClose();onSelectCustomer(c);}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 16px",borderBottom:"1px solid #f1f5f9",cursor:"pointer",background:overdue?"#fff5f5":urgent?"#fffbeb":"#fff"}} onMouseEnter={e=>e.currentTarget.style.opacity="0.8"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                  <div>
                    <div style={{fontWeight:700,fontSize:13,color:"#1e293b"}}>{c.name}</div>
                    <div style={{fontSize:11,color:"#64748b"}}>{c.town}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:12,fontWeight:700,color:overdue?"#dc2626":urgent?"#d97706":"#64748b"}}>{formatDate(c.nextFollowUp)}</div>
                    <div style={{fontSize:11,color:overdue?"#dc2626":urgent?"#d97706":"#94a3b8"}}>{overdue?`${Math.abs(days)}d overdue`:days===0?"Today":days===1?"Tomorrow":`${days}d`}</div>
                  </div>
                </div>;
              })}
            </div>
          </div>

          {/* By town */}
          <div style={{border:"1.5px solid #e2e8f0",borderRadius:12,overflow:"hidden"}}>
            <div style={{background:"#f8fafc",padding:"12px 16px",fontWeight:800,fontSize:13,color:"#1e293b",borderBottom:"1px solid #e2e8f0"}}>📍 Accounts by Town</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))"}}>
              {byTown.map(t=>(
                <div key={t.town} style={{padding:"12px 16px",borderRight:"1px solid #f1f5f9",borderBottom:"1px solid #f1f5f9"}}>
                  <div style={{fontWeight:700,fontSize:13,color:"#1e293b"}}>{t.town}</div>
                  <div style={{fontSize:12,color:"#64748b",marginTop:2}}>{t.count} accounts · <span style={{color:"#16a34a",fontWeight:600}}>{t.customers} customers</span></div>
                  <div style={{marginTop:6,background:"#e2e8f0",borderRadius:4,height:4,overflow:"hidden"}}>
                    <div style={{background:"#16a34a",height:"100%",width:`${Math.round((t.customers/Math.max(t.count,1))*100)}%`,borderRadius:4}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spend distribution */}
          <div style={{marginTop:20,border:"1.5px solid #e2e8f0",borderRadius:12,overflow:"hidden"}}>
            <div style={{background:"#f8fafc",padding:"12px 16px",fontWeight:800,fontSize:13,color:"#1e293b",borderBottom:"1px solid #e2e8f0"}}>💵 Spend Distribution</div>
            <div style={{padding:16,display:"flex",gap:12,flexWrap:"wrap"}}>
              {SPEND_TIERS.map(t=>{
                const count=customers.filter(c=>getSpendTier(c.monthlySpend).label===t.label).length;
                return<div key={t.label} style={{flex:"1 1 120px",background:t.bg,border:`1.5px solid ${t.dot}33`,borderRadius:10,padding:"12px 14px",textAlign:"center"}}>
                  <div style={{fontWeight:900,fontSize:22,color:t.color}}>{count}</div>
                  <div style={{fontSize:11,color:t.color,fontWeight:700,marginTop:2}}>{t.label}</div>
                </div>;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── WEEKLY CALL LIST ─────────────────────────────────────────────────────────
function WeeklyCallList({customers,onClose,onSelectCustomer}){
  const todayStr=today();
  const weekEnd=new Date(); weekEnd.setDate(weekEnd.getDate()+7);
  const weekEndStr=weekEnd.toISOString().split("T")[0];

  const overdue=customers.filter(c=>c.nextFollowUp&&c.nextFollowUp<todayStr).sort((a,b)=>a.nextFollowUp<b.nextFollowUp?-1:1);
  const thisWeek=customers.filter(c=>c.nextFollowUp&&c.nextFollowUp>=todayStr&&c.nextFollowUp<=weekEndStr).sort((a,b)=>a.nextFollowUp<b.nextFollowUp?-1:1);
  const highNoFollowup=customers.filter(c=>!c.nextFollowUp&&c.priority==="High"&&(c.status==="Customer"||c.status==="Active")).slice(0,10);

  const Section=({title,items,emptyMsg,bg="#fff"})=>(
    <div style={{marginBottom:20,border:"1.5px solid #e2e8f0",borderRadius:12,overflow:"hidden"}}>
      <div style={{background:bg,padding:"12px 16px",fontWeight:800,fontSize:13,color:"#1e293b",borderBottom:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        {title}<span style={{background:"#1e293b",color:"#fff",borderRadius:20,fontSize:11,fontWeight:700,padding:"2px 8px"}}>{items.length}</span>
      </div>
      {items.length===0&&<div style={{padding:"16px",color:"#94a3b8",fontSize:13,textAlign:"center"}}>{emptyMsg}</div>}
      {items.map(c=>{
        const days=daysUntil(c.nextFollowUp);
        const overdue=days!==null&&days<0;
        return<div key={c.id} onClick={()=>{onClose();onSelectCustomer(c);}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:"1px solid #f1f5f9",cursor:"pointer",background:"#fff"}} onMouseEnter={e=>e.currentTarget.style.background="#f0f9ff"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:20}}>{typeIcons[c.type]||"🏪"}</div>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:"#1e293b"}}>{c.name}</div>
              <div style={{fontSize:12,color:"#64748b"}}>{c.town} · {c.type}{c.contact?` · 👤 ${c.contact}`:""}</div>
              {c.phone&&<a href={`tel:${c.phone}`} onClick={e=>e.stopPropagation()} style={{fontSize:12,color:"#2563eb",textDecoration:"none",fontWeight:500}}>📞 {c.phone}</a>}
            </div>
          </div>
          <div style={{textAlign:"right",minWidth:100}}>
            <PriBadge p={c.priority}/>
            {c.nextFollowUp&&<div style={{fontSize:12,fontWeight:700,color:overdue?"#dc2626":"#d97706",marginTop:4}}>{overdue?`⚠️ ${Math.abs(days)}d overdue`:formatDate(c.nextFollowUp)}</div>}
            <SpendBadge spend={c.monthlySpend}/>
          </div>
        </div>;
      })}
    </div>
  );

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:720,maxHeight:"93vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,0.3)"}}>
        <div style={{background:"#1e293b",padding:"20px 24px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{color:"#fff",fontWeight:800,fontSize:18}}>📋 Weekly Call List</div>
            <div style={{color:"#64748b",fontSize:12,marginTop:2}}>Week of {new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</div>
          </div>
          <button onClick={onClose} style={{color:"#94a3b8",background:"none",border:"none",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{padding:20}}>
          <div style={{background:"#fff7ed",border:"1.5px solid #fed7aa",borderRadius:10,padding:"10px 16px",marginBottom:16,fontSize:13,color:"#92400e",fontWeight:600}}>
            💡 Tap any account to open their full profile and log your call notes
          </div>
          <Section title="🔴 Overdue Follow-Ups" items={overdue} emptyMsg="No overdue follow-ups — great work!" bg="#fff5f5"/>
          <Section title="📅 This Week" items={thisWeek} emptyMsg="No follow-ups scheduled for this week" bg="#fffbeb"/>
          <Section title="⭐ High Priority — No Follow-Up Set" items={highNoFollowup} emptyMsg="All high priority accounts have follow-ups set" bg="#f0f9ff"/>
        </div>
      </div>
    </div>
  );
}

// ─── ADD CUSTOMER MODAL ───────────────────────────────────────────────────────
function AddModal({onClose,onAdd}){
  const [f,setF]=useState({name:"",type:"Auto Repair",town:"",address:"",phone:"",contact:"",email:"",priority:"High",status:"Prospect",acctNum:"",monthlySpend:"",notes:""});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const save=()=>{if(!f.name.trim())return;const full=f.address&&f.town?`${f.address}, ${f.town}, TX`:f.address;onAdd({...f,id:Date.now(),fullAddress:full,rating:"",reviews:0,supplier:"",lastVisit:"",lastCall:"",nextFollowUp:"",relScore:"",isStocking:false,inventory:[]});onClose();};
  return(
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
function DetailModal({customer,onClose,onSave,onDelete}){
  const [f,setF]=useState({...customer});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const [confirmDel,setConfirmDel]=useState(false);
  const save=()=>{const full=f.address&&f.town?`${f.address}, ${f.town}, TX`:f.fullAddress;onSave({...f,fullAddress:full});onClose();};
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:700,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,0.3)"}}>
        {/* Header */}
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
          {/* All fields editable — name, address, phone, acct# included */}
          <div style={{marginBottom:16,padding:14,background:"#f8fafc",borderRadius:10,border:"1.5px solid #e2e8f0"}}>
            <div style={{fontWeight:700,fontSize:12,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10}}>Core Info — Tap any field to edit</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{gridColumn:"1/-1"}}><Fld label="Business Name"><input value={f.name||""} onChange={e=>set("name",e.target.value)} style={inp}/></Fld></div>
              <Fld label="Address"><input value={f.address||""} onChange={e=>set("address",e.target.value)} style={inp}/></Fld>
              <Fld label="Town"><input value={f.town||""} onChange={e=>set("town",e.target.value)} style={inp}/></Fld>
              <Fld label="Phone"><input value={f.phone||""} onChange={e=>set("phone",e.target.value)} style={inp}/></Fld>
              <Fld label="Acct # (POS)"><input value={f.acctNum||""} onChange={e=>set("acctNum",e.target.value)} style={inp} placeholder="Assign from POS"/></Fld>
            </div>
            {f.fullAddress&&<div style={{marginTop:10}}><AddrLink addr={f.address&&f.town?`${f.address}, ${f.town}, TX`:f.fullAddress}/></div>}
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
            <div><div style={{fontWeight:700,fontSize:13,color:"#0c4a6e"}}>📦 Stocking Account</div><div style={{fontSize:12,color:"#0369a1",marginTop:2}}>Enable to track inventory and reorder alerts</div></div>
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
function RoutePlanner({customers,onClose}){
  const [stops,setStops]=useState([]);
  const [search,setSearch]=useState("");
  const [saved,setSaved]=useState([]);
  const [routeName,setRouteName]=useState("");
  const pool=customers.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||c.town.toLowerCase().includes(search.toLowerCase())).slice(0,50);
  const toggle=c=>setStops(p=>p.find(s=>s.id===c.id)?p.filter(s=>s.id!==c.id):[...p,c]);
  const moveUp=i=>{if(i===0)return;const s=[...stops];[s[i-1],s[i]]=[s[i],s[i-1]];setStops(s);};
  const moveDown=i=>{if(i===stops.length-1)return;const s=[...stops];[s[i],s[i+1]]=[s[i+1],s[i]];setStops(s);};
  const saveRoute=()=>{if(!routeName.trim()||!stops.length)return;setSaved(r=>[...r,{name:routeName,stops:[...stops]}]);setRouteName("");};
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:840,maxHeight:"93vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,0.3)"}}>
        <div style={{background:"#1e293b",padding:"20px 24px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{color:"#fff",fontWeight:800,fontSize:18}}>🗺️ Route Planner</div><div style={{color:"#64748b",fontSize:12,marginTop:2}}>Build your day — opens Google Maps with all stops loaded</div></div>
          <button onClick={onClose} style={{color:"#94a3b8",background:"none",border:"none",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr"}}>
          <div style={{padding:20,borderRight:"1.5px solid #e2e8f0"}}>
            <div style={{fontWeight:700,fontSize:13,color:"#374151",marginBottom:8}}>Select Stops</div>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search..." style={{...inp,marginBottom:8}}/>
            <div style={{maxHeight:400,overflowY:"auto"}}>
              {pool.map(c=>{const isSel=stops.find(s=>s.id===c.id);return<div key={c.id} onClick={()=>toggle(c)} style={{padding:"9px 11px",borderRadius:8,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4,background:isSel?"#e0f2fe":"#f8fafc",border:isSel?"1.5px solid #38bdf8":"1.5px solid transparent"}}>
                <div><div style={{fontWeight:700,fontSize:13,color:"#1e293b"}}>{typeIcons[c.type]||"🏪"} {c.name}</div><div style={{fontSize:11,color:"#64748b"}}>{c.town} · {c.address}</div></div>
                <div style={{fontSize:17}}>{isSel?"✅":"⬜"}</div>
              </div>;})}</div>
          </div>
          <div style={{padding:20}}>
            <div style={{fontWeight:700,fontSize:13,color:"#374151",marginBottom:8}}>Your Route ({stops.length} stops)</div>
            {!stops.length&&<div style={{color:"#94a3b8",fontSize:13,textAlign:"center",padding:"36px 0"}}>Select customers on the left</div>}
            <div style={{maxHeight:260,overflowY:"auto",marginBottom:10}}>
              {stops.map((c,i)=>(
                <div key={c.id} style={{padding:"7px 10px",background:"#f8fafc",borderRadius:8,marginBottom:4,display:"flex",alignItems:"center",gap:8,border:"1.5px solid #e2e8f0"}}>
                  <span style={{fontWeight:800,fontSize:12,color:"#64748b",minWidth:18}}>{i+1}</span>
                  <div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,fontSize:12,color:"#1e293b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div><div style={{fontSize:11,color:"#64748b"}}>{c.town}</div></div>
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
            {stops.length>0&&<div style={{textAlign:"center",fontSize:11,color:"#64748b",marginTop:5}}>Opens Google Maps with all {stops.length} stops — turn-by-turn ready</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App(){
  const [customers,setCustomers]   = useState(INITIAL_CUSTOMERS);
  const [search,setSearch]         = useState("");
  const [townF,setTownF]           = useState("All Towns");
  const [priF,setPriF]             = useState("All");
  const [stsF,setStsF]             = useState("");
  const [sortBy,setSortBy]         = useState("priority");
  const [viewMode,setViewMode]     = useState("grid");
  const [selected,setSelected]     = useState(null);
  const [showAdd,setShowAdd]       = useState(false);
  const [showRoute,setShowRoute]   = useState(false);
  const [showInv,setShowInv]       = useState(false);
  const [showPrint,setShowPrint]   = useState(false);
  const [showDash,setShowDash]     = useState(false);
  const [showCalls,setShowCalls]   = useState(false);
  const [activeTab,setActiveTab]   = useState("all");

  const updC=useCallback(u=>setCustomers(cs=>cs.map(c=>c.id===u.id?u:c)),[]);
  const delC=useCallback(id=>setCustomers(cs=>cs.filter(c=>c.id!==id)),[]);
  const addC=useCallback(c=>setCustomers(cs=>[...cs,c]),[]);

  const filtered=useMemo(()=>{
    let list=activeTab==="stocking"?customers.filter(c=>c.isStocking):customers;
    if(search){const q=search.toLowerCase();list=list.filter(c=>c.name.toLowerCase().includes(q)||c.type.toLowerCase().includes(q)||c.town.toLowerCase().includes(q)||(c.notes||"").toLowerCase().includes(q)||(c.contact||"").toLowerCase().includes(q)||(c.acctNum||"").includes(q));}
    if(townF!=="All Towns")list=list.filter(c=>c.town===townF);
    if(priF!=="All")list=list.filter(c=>c.priority===priF);
    if(stsF)list=list.filter(c=>c.status===stsF);
    const ord={High:0,Medium:1,Low:2};
    if(sortBy==="priority")list=[...list].sort((a,b)=>(ord[a.priority]??3)-(ord[b.priority]??3));
    else if(sortBy==="spend")list=[...list].sort((a,b)=>(parseFloat(b.monthlySpend)||0)-(parseFloat(a.monthlySpend)||0));
    else if(sortBy==="rating")list=[...list].sort((a,b)=>(parseFloat(b.rating)||0)-(parseFloat(a.rating)||0));
    else if(sortBy==="followup")list=[...list].sort((a,b)=>(a.nextFollowUp||"9999")<(b.nextFollowUp||"9999")?-1:1);
    else if(sortBy==="name")list=[...list].sort((a,b)=>a.name.localeCompare(b.name));
    return list;
  },[customers,search,townF,priF,stsF,sortBy,activeTab]);

  const stats=useMemo(()=>({
    total:customers.length,
    active:customers.filter(c=>c.status==="Customer"||c.status==="Active").length,
    followups:customers.filter(c=>c.nextFollowUp).length,
    stocking:customers.filter(c=>c.isStocking).length,
    reorders:customers.filter(c=>c.isStocking).flatMap(c=>(c.inventory||[]).filter(i=>i.currentStock<i.parLevel)).length,
    overdue:customers.filter(c=>c.nextFollowUp&&c.nextFollowUp<today()).length,
  }),[customers]);

  return(
    <div style={{fontFamily:"'Trebuchet MS','Segoe UI',sans-serif",background:"#f1f5f9",minHeight:"100vh"}}>

      {/* ── HEADER ── */}
      <div style={{background:"#1e293b",padding:"0 24px",position:"sticky",top:0,zIndex:50,borderBottom:"3px solid #cc0000"}}>
        <div style={{maxWidth:1440,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:64}}>
          <NapaLogo/>
          <div style={{display:"flex",gap:20,alignItems:"center"}}>
            {[["🏢",stats.total,"Accounts"],["✅",stats.active,"Customers"],["📅",stats.overdue>0?`${stats.overdue} overdue`:stats.followups,"Follow-ups"],["🔴",stats.reorders,"Reorders"]].map(([icon,val,label])=>(
              <div key={label} style={{textAlign:"center",cursor:"default"}}>
                <div style={{color:label==="Reorders"&&stats.reorders>0?"#ef4444":label==="Follow-ups"&&stats.overdue>0?"#fbbf24":"#fff",fontWeight:800,fontSize:17,lineHeight:1}}>{icon} {val}</div>
                <div style={{color:"#475569",fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</div>
              </div>
            ))}
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              <button onClick={()=>setShowDash(true)}  style={{...btn("#334155"),fontSize:12}}>📊 Dashboard</button>
              <button onClick={()=>setShowCalls(true)} style={{...btn(stats.overdue>0?"#d97706":"#334155"),fontSize:12}}>📋 Call List{stats.overdue>0?` (${stats.overdue})`:""}</button>
              <button onClick={()=>setShowRoute(true)} style={{...btn("#334155"),fontSize:12}}>🗺️ Route</button>
              <button onClick={()=>setShowInv(true)}   style={{...btn(stats.reorders>0?"#dc2626":"#334155"),fontSize:12}}>📦 Inventory{stats.reorders>0?` (${stats.reorders})`:""}</button>
              <button onClick={()=>setShowAdd(true)}   style={{...btn("#cc0000"),fontSize:12}}>➕ Add</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{background:"#fff",borderBottom:"1px solid #e2e8f0",padding:"0 24px"}}>
        <div style={{maxWidth:1440,margin:"0 auto",display:"flex"}}>
          {[["all","📋 All Accounts"],["stocking",`📦 Stocking (${stats.stocking})`]].map(([tab,label])=>(
            <button key={tab} onClick={()=>setActiveTab(tab)} style={{padding:"12px 20px",border:"none",background:"none",borderBottom:activeTab===tab?"3px solid #cc0000":"3px solid transparent",color:activeTab===tab?"#cc0000":"#64748b",fontWeight:700,fontSize:13,cursor:"pointer",transition:"all 0.15s"}}>{label}</button>
          ))}
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div style={{background:"#fff",borderBottom:"1px solid #e2e8f0",padding:"9px 24px"}}>
        <div style={{maxWidth:1440,margin:"0 auto",display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          <input placeholder="🔍  Search name, town, type, notes, acct#..." value={search} onChange={e=>setSearch(e.target.value)} style={{flex:"1 1 220px",...inp,outline:"none"}}/>
          <select value={townF}  onChange={e=>setTownF(e.target.value)}  style={sel}>{ALL_TOWNS.map(t=><option key={t}>{t}</option>)}</select>
          <select value={priF}   onChange={e=>setPriF(e.target.value)}   style={sel}><option value="All">All Priorities</option>{PRIORITIES.map(p=><option key={p}>{p}</option>)}</select>
          <select value={stsF}   onChange={e=>setStsF(e.target.value)}   style={sel}><option value="">All Statuses</option>{STATUSES.filter(Boolean).map(s=><option key={s}>{s}</option>)}</select>
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

      {/* ── SPEND LEGEND ── */}
      <div style={{background:"#fff",borderBottom:"1px solid #e2e8f0",padding:"5px 24px"}}>
        <div style={{maxWidth:1440,margin:"0 auto",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <span style={{fontSize:11,color:"#64748b",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em"}}>Monthly Spend:</span>
          {SPEND_TIERS.map(t=><span key={t.label} style={{background:t.bg,color:t.color,padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700,display:"inline-flex",alignItems:"center",gap:3}}><span style={{width:6,height:6,borderRadius:"50%",background:t.dot,display:"inline-block"}}/>{t.label}</span>)}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{maxWidth:1440,margin:"0 auto",padding:"16px 24px"}}>
        {viewMode==="grid"?(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(298px,1fr))",gap:13}}>
            {filtered.map(c=>{
              const t=getSpendTier(c.monthlySpend);
              const days=daysUntil(c.nextFollowUp);
              const isOverdue=days!==null&&days<0;
              return<div key={c.id} onClick={()=>setSelected(c)} style={{background:"#fff",borderRadius:12,padding:16,cursor:"pointer",border:"1.5px solid #e2e8f0",borderLeft:`4px solid ${t.dot}`,boxShadow:"0 1px 3px rgba(0,0,0,0.05)",transition:"all 0.15s"}}
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
                {c.nextFollowUp&&<div style={{marginTop:7,padding:"4px 8px",background:isOverdue?"#fee2e2":"#fef3c7",borderRadius:6,fontSize:11,color:isOverdue?"#991b1b":"#92400e",fontWeight:600}}>{isOverdue?`⚠️ Overdue: ${formatDate(c.nextFollowUp)}`:`📅 Follow-up: ${formatDate(c.nextFollowUp)}`}</div>}
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
                    <td style={{padding:"8px 11px",fontSize:12,color:c.nextFollowUp&&daysUntil(c.nextFollowUp)<0?"#dc2626":c.nextFollowUp?"#92400e":"#d1d5db",fontWeight:c.nextFollowUp?600:400,whiteSpace:"nowrap"}}>{c.nextFollowUp?formatDate(c.nextFollowUp):"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!filtered.length&&<div style={{textAlign:"center",padding:60,color:"#94a3b8"}}><div style={{fontSize:40,marginBottom:12}}>🔍</div><div style={{fontWeight:700,fontSize:18}}>No accounts found</div><div style={{fontSize:14,marginTop:4}}>Try adjusting your filters</div></div>}
      </div>

      {/* ── MODALS ── */}
      {selected   &&<DetailModal customer={selected} onClose={()=>setSelected(null)} onSave={c=>{updC(c);setSelected(null);}} onDelete={id=>{delC(id);setSelected(null);}}/>}
      {showAdd    &&<AddModal    onClose={()=>setShowAdd(false)}  onAdd={addC}/>}
      {showRoute  &&<RoutePlanner customers={customers}           onClose={()=>setShowRoute(false)}/>}
      {showInv    &&<InvDash     customers={customers} onUpdate={updC} onClose={()=>setShowInv(false)} onPrint={()=>{setShowInv(false);setShowPrint(true);}}/>}
      {showPrint  &&<InvPrintModal customers={customers}          onClose={()=>setShowPrint(false)}/>}
      {showDash   &&<Dashboard   customers={customers} onClose={()=>setShowDash(false)} onSelectCustomer={c=>{setSelected(c);}}/>}
      {showCalls  &&<WeeklyCallList customers={customers} onClose={()=>setShowCalls(false)} onSelectCustomer={c=>{setSelected(c);}}/>}
    </div>
  );
}
