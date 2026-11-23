import { useState, useMemo, useCallback } from "react";

// ─── SPEND TIERS ─────────────────────────────────────────────────────────────
const SPEND_TIERS = [
  { value:"1500+",    label:"$1,500+",    color:"#16a34a", bg:"#dcfce7", dot:"#16a34a" },
  { value:"750-1500", label:"$750–1,500", color:"#0891b2", bg:"#cffafe", dot:"#0891b2" },
  { value:"500-750",  label:"$500–750",   color:"#d97706", bg:"#fef3c7", dot:"#d97706" },
  { value:"250-500",  label:"$250–500",   color:"#ea580c", bg:"#ffedd5", dot:"#ea580c" },
  { value:"<250",     label:"<$250",      color:"#dc2626", bg:"#fee2e2", dot:"#dc2626" },
  { value:"",         label:"Prospect",   color:"#6b7280", bg:"#f3f4f6", dot:"#9ca3af" },
];
const getSpendTier = spend => {
  if(!spend) return SPEND_TIERS[5];
  return SPEND_TIERS.find(t=>t.value===spend)||SPEND_TIERS[5];
};
// Spend tier dropdown options with colors embedded in label
const SPEND_OPTIONS = [
  {value:"",        label:"— Select Spend Tier —", color:"#6b7280"},
  {value:"1500+",   label:"🟢  $1,500+ / month",    color:"#16a34a"},
  {value:"750-1500",label:"🔵  $750 – $1,500 / mo", color:"#0891b2"},
  {value:"500-750", label:"🟡  $500 – $750 / mo",   color:"#d97706"},
  {value:"250-500", label:"🟠  $250 – $500 / mo",   color:"#ea580c"},
  {value:"<250",    label:"🔴  Under $250 / mo",    color:"#dc2626"},
];
// ─── NAPA HOME BASE ───────────────────────────────────────────────────────────
const NAPA_STORE = { name:"NAPA Auto Parts - Pilot Point", address:"1333 US-377, Pilot Point, TX 76258", lat:33.3998, lng:-96.9601 };

// Haversine distance in miles
function distMiles(lat1,lng1,lat2,lng2){
  const R=3958.8, dLat=(lat2-lat1)*Math.PI/180, dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
function distFromStore(c){ return c.lat&&c.lng ? distMiles(NAPA_STORE.lat,NAPA_STORE.lng,c.lat,c.lng) : 999; }



// ─── CUSTOMER DATA ────────────────────────────────────────────────────────────
const INITIAL_CUSTOMERS = [
  { id:1,   name:"JB's Auto Repair",                  type:"Auto Repair",        town:"Pilot Point",  address:"615 S Massey St",         fullAddress:"615 S Massey St, Pilot Point, TX 76258",            phone:"940-273-3323",   contact:"James",         email:"", rating:"",    reviews:0,   priority:"High",   status:"Customer",  acctNum:"1",     monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                         relScore:"", isStocking:false, inventory:[] , lat:33.3598, lng:-96.9613, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:2,   name:"Al's Qwik E Lube",                  type:"Quick Lube",         town:"Pilot Point",  address:"1117 US-377",              fullAddress:"1117 US-377, Pilot Point, TX 76258",                phone:"(940) 686-5823", contact:"",              email:"", rating:"4.5", reviews:94,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Bulk oil / recurring",                     relScore:"", isStocking:false, inventory:[] , lat:33.3965, lng:-96.9598, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:3,   name:"Bryant's Tire Shop",                type:"Tire Shop",          town:"Pilot Point",  address:"400 US-377",               fullAddress:"400 US-377, Pilot Point, TX 76258",                 phone:"940-286-8473",   contact:"",              email:"", rating:"4.6", reviews:164, priority:"High",   status:"Customer",  acctNum:"288",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Used tires",                               relScore:"", isStocking:false, inventory:[] , lat:33.3951, lng:-96.9592, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:4,   name:"Key Auto Repairs",                  type:"Auto Repair",        town:"Pilot Point",  address:"608 N Washington St",      fullAddress:"608 N Washington St, Pilot Point, TX 76258",        phone:"940-218-5439",   contact:"Steven",        email:"", rating:"4.9", reviews:41,  priority:"High",   status:"Customer",  acctNum:"235",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"General repairs",                          relScore:"", isStocking:false, inventory:[] , lat:33.3972, lng:-96.9574, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:5,   name:"Caliber Collision",                 type:"Auto Body",          town:"Pilot Point",  address:"8600 US-377",              fullAddress:"8600 US-377, Pilot Point, TX 76258",                phone:"(940) 290-0305", contact:"",              email:"", rating:"4.9", reviews:79,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Collision / body",                         relScore:"", isStocking:false, inventory:[] , lat:33.4401, lng:-96.957, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:6,   name:"Mark's Body Shop",                  type:"Auto Body",          town:"Pilot Point",  address:"1112 US-377",              fullAddress:"1112 US-377, Pilot Point, TX 76258",                phone:"940-686-5194",   contact:"Mark",          email:"", rating:"4.9", reviews:40,  priority:"High",   status:"Customer",  acctNum:"1350",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Body shop",                                relScore:"", isStocking:false, inventory:[] , lat:33.3968, lng:-96.9595, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:7,   name:"Speed Shop Garage",                 type:"Restoration",        town:"Pilot Point",  address:"1145 Jc Ln",               fullAddress:"1145 Jc Ln, Pilot Point, TX 76258",                 phone:"(469) 756-9065", contact:"",              email:"", rating:"5.0", reviews:1,   priority:"Medium", status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Classic restoration",                      relScore:"", isStocking:false, inventory:[] , lat:33.3981, lng:-96.9588, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:8,   name:"R&M Garage LLC",                    type:"Auto Repair",        town:"Pilot Point",  address:"10221 FM 455 E",           fullAddress:"10221 FM 455 E, Pilot Point, TX 76258",             phone:"214-354-3353",   contact:"Brian",         email:"", rating:"4.9", reviews:39,  priority:"High",   status:"Customer",  acctNum:"1851",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Full service",                             relScore:"", isStocking:false, inventory:[] , lat:33.4108, lng:-96.923, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:9,   name:"All American Towing",               type:"Towing",             town:"Pilot Point",  address:"561 E Blackjack Rd",       fullAddress:"561 E Blackjack Rd, Pilot Point, TX 76258",         phone:"(940) 627-2800", contact:"",              email:"", rating:"4.2", reviews:82,  priority:"Medium", status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Fleet / towing",                           relScore:"", isStocking:false, inventory:[] , lat:33.421, lng:-96.918, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:10,  name:"Dan's Equipment Sales",             type:"Tractor Dealer",     town:"Pilot Point",  address:"1212 S Washington St",     fullAddress:"1212 S Washington St, Pilot Point, TX 76258",       phone:"940-206-2809",   contact:"Dan",           email:"", rating:"4.3", reviews:27,  priority:"High",   status:"Customer",  acctNum:"1440",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Equipment / tractor sales",                relScore:"", isStocking:false, inventory:[] , lat:33.3961, lng:-96.9578, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:11,  name:"Big Brand Tire & Service (PP)",     type:"Tire Shop",          town:"Pilot Point",  address:"1321 N Hwy 377",           fullAddress:"1321 N Hwy 377, Pilot Point, TX 76258",             phone:"940-686-8473",   contact:"John",          email:"", rating:"4.7", reviews:573, priority:"High",   status:"Customer",  acctNum:"4017",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Stocking: filters & batteries",            relScore:"", isStocking:true,  inventory:[{id:"bb-pp-1",partNum:"21348",description:"Oil Filter",parLevel:12,currentStock:0,category:"Oil Filters"},{id:"bb-pp-2",partNum:"78-8C",description:"Battery Grp 78",parLevel:4,currentStock:0,category:"Batteries"}] , lat:33.401, lng:-96.9602, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:12,  name:"Luna's Mod Shop",                   type:"Mechanic",           town:"Pilot Point",  address:"703 Brenda's Way",         fullAddress:"703 Brenda's Way, Pilot Point, TX 76258",           phone:"214-500-7137",   contact:"Alex",          email:"", rating:"5.0", reviews:42,  priority:"High",   status:"Customer",  acctNum:"201",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"General mechanic",                         relScore:"", isStocking:false, inventory:[] , lat:33.3975, lng:-96.9585, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:13,  name:"Sanchez Tire Shop",                 type:"Tire Shop",          town:"Pilot Point",  address:"208 W Walcott St",         fullAddress:"208 W Walcott St, Pilot Point, TX 76258",           phone:"940-300-7209",   contact:"Sanchez",       email:"", rating:"4.4", reviews:28,  priority:"High",   status:"Customer",  acctNum:"39",    monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Tire service",                             relScore:"", isStocking:false, inventory:[] , lat:33.3963, lng:-96.957, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:14,  name:"JJRush Performance & Automotive",   type:"Auto Repair",        town:"Pilot Point",  address:"303 W Walcott St",         fullAddress:"303 W Walcott St, Pilot Point, TX 76258",           phone:"940-686-6860",   contact:"JJ",            email:"", rating:"4.2", reviews:137, priority:"High",   status:"Customer",  acctNum:"17",    monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Performance automotive",                   relScore:"", isStocking:false, inventory:[] , lat:33.396, lng:-96.9568, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:15,  name:"Platinum Ford North (Parts)",       type:"Auto Parts Store",   town:"Pilot Point",  address:"11590 S Hwy 377",          fullAddress:"11590 S Hwy 377, Pilot Point, TX 76258",            phone:"940-686-2236",   contact:"Jack",          email:"", rating:"5.0", reviews:4,   priority:"High",   status:"Customer",  acctNum:"1410",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Dealership parts department",              relScore:"", isStocking:false, inventory:[] , lat:33.485, lng:-96.959, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:16,  name:"Paschal Performance",               type:"Auto Repair",        town:"Pilot Point",  address:"930 N Hwy 377",            fullAddress:"930 N Hwy 377, Pilot Point, TX 76258",              phone:"817-578-5308",   contact:"",              email:"", rating:"",    reviews:0,   priority:"Medium", status:"Customer",  acctNum:"231",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                         relScore:"", isStocking:false, inventory:[] , lat:33.3985, lng:-96.9596, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:17,  name:"Outback Garage",                    type:"Auto Repair",        town:"Pilot Point",  address:"1321 N Saint James Rd",    fullAddress:"1321 N Saint James Rd, Pilot Point, TX 76258",      phone:"940-300-1149",   contact:"",              email:"", rating:"",    reviews:0,   priority:"Medium", status:"Customer",  acctNum:"819",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                         relScore:"", isStocking:false, inventory:[] , lat:33.3978, lng:-96.9591, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:18,  name:"TNJ's Automotive",                  type:"Auto Repair",        town:"Pilot Point",  address:"700 N Jefferson St",       fullAddress:"700 N Jefferson St, Pilot Point, TX 76258",         phone:"940-442-3811",   contact:"Tony",          email:"", rating:"",    reviews:0,   priority:"High",   status:"Customer",  acctNum:"186",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                         relScore:"", isStocking:false, inventory:[] , lat:33.399, lng:-96.9582, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:19,  name:"North TX Precision Machining",      type:"Machine Shop",       town:"Pilot Point",  address:"1216 N Hwy 377",           fullAddress:"1216 N Hwy 377, Pilot Point, TX 76258",             phone:"940-686-2326",   contact:"",              email:"", rating:"",    reviews:0,   priority:"Medium", status:"Customer",  acctNum:"145",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                         relScore:"", isStocking:false, inventory:[] , lat:33.3988, lng:-96.9598, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:20,  name:"Staley Steel",                      type:"Steel Fabrication",  town:"Pilot Point",  address:"9620 St John Rd",          fullAddress:"9620 St John Rd, Pilot Point, TX 76258",            phone:"940-686-6000",   contact:"Dale",          email:"", rating:"",    reviews:0,   priority:"High",   status:"Customer",  acctNum:"3200",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                         relScore:"", isStocking:false, inventory:[] , lat:33.418, lng:-96.932, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:21,  name:"Ardon Brothers Tire Shop",          type:"Tire Shop",          town:"Pilot Point",  address:"1293 US-377",              fullAddress:"1293 US-377, Pilot Point, TX 76258",                phone:"(214) 586-4009", contact:"",              email:"", rating:"5.0", reviews:2,   priority:"Medium", status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Tire and repair",                          relScore:"", isStocking:false, inventory:[] , lat:33.3975, lng:-96.96, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:30,  name:"Cummins Auto",                      type:"Auto Repair",        town:"Sanger",       address:"1220 FM 455 W Unit E1",    fullAddress:"1220 FM 455 W, Sanger, TX 76266",                   phone:"(940) 735-6752", contact:"",              email:"", rating:"4.5", reviews:46,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"General repair",                           relScore:"", isStocking:false, inventory:[] , lat:33.3571, lng:-97.1713, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:31,  name:"After Hours Motorsports",           type:"Jeep / Off-Road",    town:"Sanger",       address:"8307 FM 2164 Bldg 6",      fullAddress:"8307 FM 2164, Sanger, TX 76266",                    phone:"(940) 735-3500", contact:"",              email:"", rating:"4.9", reviews:53,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Jeep specialist",                          relScore:"", isStocking:false, inventory:[] , lat:33.374, lng:-97.195, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:32,  name:"Randy's of Sanger",                 type:"Auto Repair",        town:"Sanger",       address:"203 W Chapman Dr",         fullAddress:"203 W Chapman Dr, Sanger, TX 76266",                phone:"(940) 535-4045", contact:"",              email:"", rating:"4.5", reviews:76,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Multi-service",                            relScore:"", isStocking:false, inventory:[] , lat:33.3599, lng:-97.1698, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:33,  name:"Family First Automotive",           type:"Auto Repair",        town:"Sanger",       address:"300 N Stemmons St",        fullAddress:"300 N Stemmons St, Sanger, TX 76266",               phone:"(940) 458-8519", contact:"",              email:"", rating:"4.7", reviews:120, priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"General repair",                           relScore:"", isStocking:false, inventory:[] , lat:33.3615, lng:-97.172, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:34,  name:"Marvin's Auto Repair",              type:"Auto Repair",        town:"Sanger",       address:"209 E Chapman Dr",         fullAddress:"209 E Chapman Dr, Sanger, TX 76266",                phone:"(940) 458-5211", contact:"",              email:"", rating:"4.9", reviews:41,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"General automotive",                       relScore:"", isStocking:false, inventory:[] , lat:33.3588, lng:-97.1685, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:35,  name:"City of Sanger",                    type:"Municipal Fleet",    town:"Sanger",       address:"100 Cherry St",            fullAddress:"100 Cherry St, Sanger, TX 76266",                   phone:"940-458-4721",   contact:"",              email:"", rating:"",    reviews:0,   priority:"High",   status:"Customer",  acctNum:"97",    monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Municipal fleet",                          relScore:"", isStocking:false, inventory:[] , lat:33.3621, lng:-97.1728, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:36,  name:"Renewal Contractors",               type:"Construction",       town:"Sanger",       address:"7139 Odum Rd",             fullAddress:"7139 Odum Rd, Sanger, TX 76266",                    phone:"972-523-4414",   contact:"",              email:"", rating:"",    reviews:0,   priority:"Medium", status:"Customer",  acctNum:"430",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                         relScore:"", isStocking:false, inventory:[] , lat:33.355, lng:-97.164, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:37,  name:"Bonet Transmission & Auto Repair",  type:"Transmission Shop",  town:"Sanger",       address:"1252 FM 455 W",            fullAddress:"1252 FM 455 W, Sanger, TX 76266",                   phone:"(940) 395-5231", contact:"",              email:"", rating:"5.0", reviews:3,   priority:"Medium", status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Transmission specialist",                  relScore:"", isStocking:false, inventory:[] , lat:33.3578, lng:-97.1702, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:40,  name:"Fifth Gear Automotive",             type:"Auto Repair",        town:"Cross Roads",  address:"7351 US-377",              fullAddress:"7351 US-377, Cross Roads, TX 76227",                phone:"817-540-7500",   contact:"Calvin",        email:"", rating:"4.9", reviews:668, priority:"High",   status:"Customer",  acctNum:"258",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Highest volume. Rotors for police, Mobil 1 ULV.",  relScore:"", isStocking:false, inventory:[] , lat:33.2271, lng:-97.0218, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:41,  name:"Big Brand Tire & Service (CR)",     type:"Tire Shop",          town:"Cross Roads",  address:"100 Naylor Rd",            fullAddress:"100 Naylor Rd, Cross Roads, TX 76227",              phone:"940-240-6828",   contact:"Brian",         email:"", rating:"4.6", reviews:600, priority:"High",   status:"Customer",  acctNum:"4014",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Stocking: filters & batteries",            relScore:"", isStocking:true,  inventory:[{id:"bb-cr-1",partNum:"21348",description:"Oil Filter",parLevel:12,currentStock:0,category:"Oil Filters"},{id:"bb-cr-2",partNum:"78-8C",description:"Battery Grp 78",parLevel:4,currentStock:0,category:"Batteries"}] , lat:33.2285, lng:-97.0225, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:50,  name:"Providence Automotive",             type:"Auto Repair",        town:"Aubrey",       address:"2761 FM 2931",             fullAddress:"2761 FM 2931, Aubrey, TX 76227",                    phone:"940-365-9410",   contact:"Mike/Andrew",   email:"", rating:"4.9", reviews:537, priority:"High",   status:"Customer",  acctNum:"50088", monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Large shop",                               relScore:"", isStocking:false, inventory:[] , lat:33.2012, lng:-97.0445, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:51,  name:"Aubrey Automotive Repair Center",   type:"Auto Repair",        town:"Aubrey",       address:"800 US-377",               fullAddress:"800 US-377, Aubrey, TX 76227",                      phone:"(940) 365-1002", contact:"",              email:"", rating:"4.8", reviews:160, priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Strong reviews",                           relScore:"", isStocking:false, inventory:[] , lat:33.2095, lng:-96.9989, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:52,  name:"Ultimate Auto Repair",              type:"Auto Repair",        town:"Aubrey",       address:"700 US-377",               fullAddress:"700 US-377, Aubrey, TX 76227",                      phone:"(940) 365-9997", contact:"",              email:"", rating:"4.5", reviews:111, priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Busy general",                             relScore:"", isStocking:false, inventory:[] , lat:33.2081, lng:-96.9985, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:53,  name:"Superhero Automotive Repairs",      type:"Auto Repair",        town:"Aubrey",       address:"9053 Ike Byrom Rd",        fullAddress:"9053 Ike Byrom Rd, Aubrey, TX 76227",               phone:"(940) 945-7987", contact:"",              email:"", rating:"4.9", reviews:48,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Excellent reviews",                        relScore:"", isStocking:false, inventory:[] , lat:33.195, lng:-97.038, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:54,  name:"GTG RV Repair & Rentals",           type:"RV Repair",          town:"Aubrey",       address:"4320 US-377",              fullAddress:"4320 US-377, Aubrey, TX 76227",                     phone:"940-334-7471",   contact:"Kristi",        email:"", rating:"4.8", reviews:66,  priority:"High",   status:"Customer",  acctNum:"245",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Great relationship — call us first.",      relScore:"", isStocking:false, inventory:[] , lat:33.214, lng:-96.9982, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:55,  name:"AntiMatter Performance",            type:"Performance",        town:"Aubrey",       address:"2601 Wheeler Ave",         fullAddress:"2601 Wheeler Ave, Aubrey, TX 76227",                phone:"(972) 342-8871", contact:"",              email:"", rating:"5.0", reviews:87,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Performance",                              relScore:"", isStocking:false, inventory:[] , lat:33.1988, lng:-97.021, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:56,  name:"Stett's Diesel Trucks",             type:"Diesel Truck",       town:"Aubrey",       address:"2160 Rockhill Rd",         fullAddress:"2160 Rockhill Rd, Aubrey, TX 76227",                phone:"(972) 423-3310", contact:"",              email:"", rating:"5.0", reviews:45,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Diesel trucks",                            relScore:"", isStocking:false, inventory:[] , lat:33.1875, lng:-97.054, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:57,  name:"428Auto",                           type:"Auto Repair",        town:"Aubrey",       address:"110 N Sherman Dr",         fullAddress:"110 N Sherman Dr, Aubrey, TX 76227",                phone:"469-779-5195",   contact:"",              email:"", rating:"4.1", reviews:14,  priority:"Medium", status:"Customer",  acctNum:"278",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Smaller shop",                             relScore:"", isStocking:false, inventory:[] , lat:33.211, lng:-97.0015, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:58,  name:"DFW Luxury Automotive Group",       type:"Auto Repair",        town:"Aubrey",       address:"1518 Navo Rd Suite B-01",  fullAddress:"1518 Navo Rd, Aubrey, TX 76227",                    phone:"(214) 404-2881", contact:"",              email:"", rating:"4.9", reviews:163, priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Luxury automotive",                        relScore:"", isStocking:false, inventory:[] , lat:33.198, lng:-97.035, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:59,  name:"Brad's Automotive (Aubrey)",        type:"Auto Repair",        town:"Aubrey",       address:"210 S Hwy 377",            fullAddress:"210 S Hwy 377, Aubrey, TX 76227",                   phone:"940-365-9006",   contact:"Brad",          email:"", rating:"4.9", reviews:44,  priority:"High",   status:"Customer",  acctNum:"273",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"General repair",                           relScore:"", isStocking:false, inventory:[] , lat:33.2075, lng:-96.9978, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:60,  name:"Frank Bartel Transportation",       type:"Trucking",           town:"Aubrey",       address:"7401 US-377",              fullAddress:"7401 US-377, Aubrey, TX 76227",                     phone:"940-440-3230",   contact:"Miguel",        email:"", rating:"4.5", reviews:22,  priority:"High",   status:"Customer",  acctNum:"1635",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Heavy trucking. Stocking account.",        relScore:"", isStocking:true,  inventory:[{id:"fbt-1",partNum:"21348",description:"Oil Filter",parLevel:6,currentStock:0,category:"Oil Filters"},{id:"fbt-2",partNum:"LF-9080",description:"HD Oil Filter",parLevel:4,currentStock:0,category:"Oil Filters"}] , lat:33.225, lng:-96.997, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:61,  name:"Moss Performance",                  type:"ATV Repair",         town:"Aubrey",       address:"2576 FM 455",              fullAddress:"2576 FM 455, Aubrey, TX 76227",                     phone:"702-441-5851",   contact:"",              email:"", rating:"4.4", reviews:55,  priority:"Medium", status:"Customer",  acctNum:"246",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"ATV / powersports",                        relScore:"", isStocking:false, inventory:[] , lat:33.196, lng:-97.005, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:62,  name:"Big Brand Tire & Service (SAV)",    type:"Tire Shop",          town:"Aubrey",       address:"26779 US-380",             fullAddress:"26779 US-380, Aubrey, TX 76227",                    phone:"469-715-0028",   contact:"Danny",         email:"", rating:"4.6", reviews:600, priority:"High",   status:"Customer",  acctNum:"4015",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Stocking: filters & batteries",            relScore:"", isStocking:true,  inventory:[{id:"bb-sav-1",partNum:"21348",description:"Oil Filter",parLevel:12,currentStock:0,category:"Oil Filters"},{id:"bb-sav-2",partNum:"78-8C",description:"Battery Grp 78",parLevel:4,currentStock:0,category:"Batteries"}] , lat:33.1751, lng:-97.0631, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:63,  name:"RTEL Construction",                 type:"Construction",       town:"Aubrey",       address:"8291 FM 2931",             fullAddress:"8291 FM 2931, Aubrey, TX 76227",                    phone:"940-365-0895",   contact:"",              email:"", rating:"",    reviews:0,   priority:"Medium", status:"Customer",  acctNum:"159",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                         relScore:"", isStocking:false, inventory:[] , lat:33.199, lng:-97.044, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:64,  name:"BSP Motorsports LLC",               type:"Performance",        town:"Aubrey",       address:"14546 Industrial Park",    fullAddress:"14546 Industrial Park, Aubrey, TX 76227",           phone:"(469) 731-5887", contact:"",              email:"", rating:"4.9", reviews:208, priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Performance",                              relScore:"", isStocking:false, inventory:[] , lat:33.182, lng:-97.028, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:70,  name:"Xclusive Truck Kustoms",            type:"Truck Accessories",  town:"Celina",       address:"200 S Louisiana Dr #120",  fullAddress:"200 S Louisiana Dr, Celina, TX 75009",             phone:"(214) 687-2703", contact:"",              email:"", rating:"4.7", reviews:171, priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Truck custom",                             relScore:"", isStocking:false, inventory:[] , lat:33.3148, lng:-96.7826, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:71,  name:"Celina Diesel",                     type:"Diesel Repair",      town:"Celina",       address:"11187 Co Rd 95",           fullAddress:"11187 Co Rd 95, Celina, TX 75009",                  phone:"(469) 502-3550", contact:"",              email:"", rating:"5.0", reviews:22,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Diesel specialist",                        relScore:"", isStocking:false, inventory:[] , lat:33.339, lng:-96.764, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:72,  name:"RX Collision Celina",               type:"Auto Body",          town:"Celina",       address:"112 W Ash St",             fullAddress:"112 W Ash St, Celina, TX 75009",                    phone:"(972) 382-3040", contact:"",              email:"", rating:"4.9", reviews:40,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Collision",                                relScore:"", isStocking:false, inventory:[] , lat:33.3155, lng:-96.782, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:73,  name:"D & V Auto Repair",                 type:"Auto Repair",        town:"Celina",       address:"106 N Louisiana Dr",       fullAddress:"106 N Louisiana Dr, Celina, TX 75009",             phone:"972-382-3601",   contact:"",              email:"", rating:"4.5", reviews:156, priority:"Medium", status:"Customer",  acctNum:"1620",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"General",                                  relScore:"", isStocking:false, inventory:[] , lat:33.3142, lng:-96.7822, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:74,  name:"FCS Construction LLC",              type:"Construction Fleet", town:"Celina",       address:"1490 N Louisiana Dr",      fullAddress:"1490 N Louisiana Dr, Celina, TX 75009",            phone:"214-551-2348",   contact:"Sean/Barry",    email:"", rating:"4.6", reviews:8,   priority:"High",   status:"Customer",  acctNum:"2800",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Construction fleet",                       relScore:"", isStocking:false, inventory:[] , lat:33.3168, lng:-96.783, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:75,  name:"Dickerson Construction Co",         type:"Construction Fleet", town:"Celina",       address:"1130 N Louisiana Dr",      fullAddress:"1130 N Louisiana Dr, Celina, TX 75009",            phone:"972-382-2123",   contact:"Devin/Blake",   email:"", rating:"3.3", reviews:6,   priority:"Medium", status:"Customer",  acctNum:"28",    monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Will call if needed.",                      relScore:"", isStocking:false, inventory:[] , lat:33.316, lng:-96.7825, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:76,  name:"1876 Country Club",                 type:"Golf / Fleet",       town:"Celina",       address:"3500 N Legacy Dr",         fullAddress:"3500 N Legacy Dr, Celina, TX 75009",               phone:"214-497-1097",   contact:"",              email:"", rating:"",    reviews:0,   priority:"Medium", status:"Customer",  acctNum:"287",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                         relScore:"", isStocking:false, inventory:[] , lat:33.345, lng:-96.778, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:80,  name:"Hickman Creations",                 type:"Auto Restoration",   town:"Gunter",       address:"424 W Main St",            fullAddress:"424 W Main St, Gunter, TX 75058",                   phone:"(903) 228-5014", contact:"",              email:"", rating:"4.0", reviews:21,  priority:"Medium", status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Classic cars",                             relScore:"", isStocking:false, inventory:[] , lat:33.4438, lng:-96.753, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:81,  name:"Rushton Automotive",                type:"Auto Repair",        town:"Gunter",       address:"424 W Main St Suite 6",    fullAddress:"424 W Main St, Gunter, TX 75058",                   phone:"(972) 433-3972", contact:"",              email:"", rating:"5.0", reviews:10,  priority:"Medium", status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Small repair",                             relScore:"", isStocking:false, inventory:[] , lat:33.444, lng:-96.7532, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:82,  name:"Mario Jr Tire Service",             type:"Tire Shop",          town:"Gunter",       address:"341 Stiff Chapel Rd",      fullAddress:"341 Stiff Chapel Rd, Gunter, TX 75058",             phone:"903-816-1459",   contact:"Mario",         email:"", rating:"",    reviews:0,   priority:"High",   status:"Customer",  acctNum:"64",    monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                         relScore:"", isStocking:false, inventory:[] , lat:33.439, lng:-96.741, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:90,  name:"Three Seventy Seven Tires",         type:"Tire & Oil",         town:"Collinsville", address:"719 US-377",               fullAddress:"719 US-377, Collinsville, TX 76233",                phone:"(903) 429-3425", contact:"",              email:"", rating:"4.6", reviews:66,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Tires + oil",                              relScore:"", isStocking:false, inventory:[] , lat:33.556, lng:-97.022, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:91,  name:"Collinsville Tire Shop",            type:"Tire Shop",          town:"Collinsville", address:"9415 US-377",              fullAddress:"9415 US-377, Collinsville, TX 76233",               phone:"(214) 549-7306", contact:"",              email:"", rating:"5.0", reviews:72,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Tire shop",                                relScore:"", isStocking:false, inventory:[] , lat:33.558, lng:-97.0218, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:92,  name:"Brad's Automotive (Collinsville)",  type:"Auto Repair",        town:"Collinsville", address:"2118 Dawkins Rd",          fullAddress:"2118 Dawkins Rd, Collinsville, TX 76233",           phone:"(903) 429-6022", contact:"",              email:"", rating:"4.9", reviews:21,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"General repair",                           relScore:"", isStocking:false, inventory:[] , lat:33.5542, lng:-97.0198, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:93,  name:"Jesse Buttress Sand & Gravel",      type:"Construction",       town:"Collinsville", address:"182 Cobler Rd",            fullAddress:"182 Cobler Rd, Collinsville, TX 76233",             phone:"214-243-7676",   contact:"Jesse",         email:"", rating:"",    reviews:0,   priority:"Medium", status:"Customer",  acctNum:"239",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"",                                         relScore:"", isStocking:false, inventory:[] , lat:33.549, lng:-97.015, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:100, name:"Myrt's Paint & Body",               type:"Auto Body",          town:"Tioga",        address:"211 S Donaton St",         fullAddress:"211 S Donaton St, Tioga, TX 76271",                 phone:"(903) 815-5959", contact:"",              email:"", rating:"5.0", reviews:9,   priority:"Medium", status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Body shop",                                relScore:"", isStocking:false, inventory:[] , lat:33.4709, lng:-96.9218, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:101, name:"USA Trucking Inc",                  type:"Trucking",           town:"Tioga",        address:"616 Bodovsky Rd",          fullAddress:"616 Bodovsky Rd, Tioga, TX 76271",                  phone:"940-437-5222",   contact:"",              email:"", rating:"3.3", reviews:7,   priority:"Medium", status:"Customer",  acctNum:"1280",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Bulk hauling",                             relScore:"", isStocking:false, inventory:[] , lat:33.472, lng:-96.922, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:110, name:"BURNCO Ready-Mix",                  type:"Ready Mix Concrete", town:"Krugerville",  address:"9170 Ike Byrom Rd",        fullAddress:"9170 Ike Byrom Rd, Aubrey, TX 76227",               phone:"469-647-3604",   contact:"Bryant/Roberts",email:"", rating:"4.7", reviews:6,   priority:"High",   status:"Customer",  acctNum:"2560",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Interested in Milwaukee tools.",            relScore:"", isStocking:false, inventory:[] , lat:33.184, lng:-97.067, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:111, name:"Nuts and Volts Automotive",         type:"Auto Repair",        town:"Krugerville",  address:"4900 US-377",              fullAddress:"4900 US-377, Krugerville, TX 76227",                phone:"972-505-6132",   contact:"Tess/Ryan",     email:"", rating:"4.9", reviews:29,  priority:"High",   status:"Customer",  acctNum:"267",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Call us first — excellent relationship.",  relScore:"", isStocking:false, inventory:[] , lat:33.185, lng:-97.066, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:112, name:"META COLLISION",                    type:"Auto Body",          town:"Krugerville",  address:"8171 US-377",              fullAddress:"8171 US-377, Krugerville, TX 76227",                phone:"(214) 783-9466", contact:"",              email:"", rating:"5.0", reviews:50,  priority:"High",   status:"Prospect",  acctNum:"",      monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Collision center",                         relScore:"", isStocking:false, inventory:[] , lat:33.186, lng:-97.0665, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:113, name:"A-Z Bus Sales",                     type:"Fleet / Bus",        town:"Krugerville",  address:"1003 Prosperity Way",      fullAddress:"1003 Prosperity Way, Krugerville, TX 76227",        phone:"214-693-5299",   contact:"Michael/Ashley",email:"", rating:"",    reviews:0,   priority:"High",   status:"Customer",  acctNum:"238",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"AP dept follow-up. Good relationship.",   relScore:"", isStocking:false, inventory:[] , lat:33.1845, lng:-97.0655, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:120, name:"Abilene Diesel Performance DFW",    type:"Diesel Repair",      town:"Valley View",  address:"6444 E Lone Oak Rd",       fullAddress:"6444 E Lone Oak Rd, Valley View, TX 76272",         phone:"940-580-0646",   contact:"Eric/Courtney", email:"", rating:"5.0", reviews:44,  priority:"High",   status:"Customer",  acctNum:"316",   monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Diesel performance",                       relScore:"", isStocking:false, inventory:[] , lat:33.532, lng:-97.156, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
  { id:130, name:"Big Brand Tire & Service (Sherman)",type:"Tire Shop",          town:"Sherman",      address:"4001 Texoma Pkwy",         fullAddress:"4001 Texoma Pkwy, Sherman, TX 75090",               phone:"903-868-8072",   contact:"Mark",          email:"", rating:"",    reviews:0,   priority:"High",   status:"Customer",  acctNum:"4016",  monthlySpend:"", supplier:"", lastVisit:"", lastCall:"", nextFollowUp:"", notes:"Stocking: filters & batteries",            relScore:"", isStocking:true,  inventory:[{id:"bb-sh-1",partNum:"21348",description:"Oil Filter",parLevel:12,currentStock:0,category:"Oil Filters"},{id:"bb-sh-2",partNum:"78-8C",description:"Battery Grp 78",parLevel:4,currentStock:0,category:"Batteries"}] , lat:33.6289, lng:-96.6088, competitor:"", callLog:[], spendHistory:[], repName:"", lostReason:""},
];

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const STATUSES   = ["","Customer","Active","Prospect","Warm Lead","Cold","Not Interested"];
const COMPETITORS = ["","O'Reilly","AutoZone","Parts Plus","Carquest","NAPA","Worldpac","Dealership","Other"];
const REPS = ["","Chris","Outside Rep","Store Staff"];
const LOST_REASONS = ["","Price","Relationship","Product Availability","Went to Competitor","Out of Business","Other"];

const PRIORITIES = ["High","Medium","Low"];
const ALL_TOWNS  = ["All Towns",...Array.from(new Set(INITIAL_CUSTOMERS.map(c=>c.town))).sort()];

// ─── NAPA BRAND PALETTE ───────────────────────────────────────────────────────
const NAPA_NAVY   = "#081d63";  // management report navy
const NAPA_BLUE   = "#092a91";  // secondary navy accent
const NAPA_RED    = "#cc0000";  // NAPA red
const NAPA_YELLOW = "#ffc928";  // NAPA yellow
const NAPA_PANEL  = "#f3f6fb";  // light panel
const NAPA_BODY   = "#2a3550";  // body text

const priorityConfig = {
  High:   {bg:"#fde8e8",text:"#9b0000",dot:NAPA_RED},
  Medium: {bg:"#fff5d6",text:"#5a3e00",dot:NAPA_YELLOW},
  Low:    {bg:"#e8ecf8",text:NAPA_NAVY,dot:NAPA_NAVY},
};
const statusColors = {
  Customer:"#16a34a",Active:"#0891b2","Warm Lead":"#d97706",
  Prospect:NAPA_YELLOW,Cold:"#9ca3af","Not Interested":NAPA_RED,"":"#9ca3af"
};
const statusTextColors = {
  Customer:"#fff",Active:"#fff","Warm Lead":"#fff",
  Prospect:NAPA_NAVY,Cold:"#fff","Not Interested":"#fff","":"#fff"
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
  const enc=s=>encodeURIComponent(s).replace(/%20/g,"+");
  if(stops.length===1)return`https://maps.google.com/?q=${enc(stops[0].fullAddress)}`;
  const o=enc(stops[0].fullAddress),d=enc(stops[stops.length-1].fullAddress);
  const w=stops.slice(1,-1).map(s=>enc(s.fullAddress)).join("|");
  return`https://www.google.com/maps/dir/?api=1&origin=${o}&destination=${d}${w?`&waypoints=${w}`:""}&travelmode=driving`;
}

const today = ()=>new Date().toISOString().split("T")[0];
const formatDate = d=>{ if(!d)return""; const dt=new Date(d+"T12:00:00"); return dt.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}); };
const daysUntil = d=>{ if(!d)return null; const diff=new Date(d+"T12:00:00")-new Date(); return Math.ceil(diff/(1000*60*60*24)); };

// ─── STYLES ───────────────────────────────────────────────────────────────────
const inp  = {width:"100%",border:"1.5px solid #c8d3e8",borderRadius:8,padding:"8px 10px",fontSize:13,color:NAPA_BODY,boxSizing:"border-box",background:"#fff"};
const sel  = {border:"1.5px solid #c8d3e8",borderRadius:8,padding:"8px 10px",fontSize:13,color:NAPA_BODY,background:"#fff",cursor:"pointer"};
const lbl  = {display:"block",fontSize:11,fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4};
const btn  = (bg,color="#fff")=>({padding:"9px 18px",background:bg,border:"none",borderRadius:8,color,fontWeight:700,cursor:"pointer",fontSize:13});

// ─── ATOMS ────────────────────────────────────────────────────────────────────
function PriBadge({p}){const c=priorityConfig[p]||{bg:"#f3f4f6",text:"#374151",dot:"#9ca3af"};return<span style={{background:c.bg,color:c.text,padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700,display:"inline-flex",alignItems:"center",gap:4}}><span style={{width:6,height:6,borderRadius:"50%",background:c.dot,display:"inline-block"}}/>{p}</span>;}
function StsBadge({s}){const bg=statusColors[s]||"#9ca3af";const txt=statusTextColors[s]||"#fff";return<span style={{background:bg,color:txt,padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700}}>{s||"Unset"}</span>;}
function SpendBadge({spend}){const t=getSpendTier(spend);return<span style={{background:t.bg,color:t.color,padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700,display:"inline-flex",alignItems:"center",gap:4}}><span style={{width:6,height:6,borderRadius:"50%",background:t.dot,display:"inline-block"}}/>{t.label}</span>;}
function AddrLink({addr,style={}}){if(!addr)return<span style={{color:"#9ca3af"}}>—</span>;return<a href={mapsUrl(addr)} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{color:"#2563eb",fontSize:13,fontWeight:500,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:3,...style}} onMouseEnter={e=>e.currentTarget.style.textDecoration="underline"} onMouseLeave={e=>e.currentTarget.style.textDecoration="none"}>📍 {addr}</a>;}
function Fld({label,children}){return<div><label style={lbl}>{label}</label>{children}</div>;}

// ─── NAPA LOGO / BRAND MARK ───────────────────────────────────────────────────
const NAPA_LOGO_B64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC0AAAAsCAYAAADxRjE/AAAJ3ElEQVR42u2ZaaxVVxXHf2vvc8f33r0P6APeUKAIT9rSQqEM0WJp65RYjbV1iGK0MTH6QY02VRMHxKhRKyaaql9MB1ujQvWDsR+0JqB16EC1g9BSLKXAm6c7z3svP5x7H0N58IDXxA/dycm9uefsvdf5r//677XWhdfH62PGIec7QRVhL5a9+DmxYCuGrTgR9HWkpxEGeKJjPtHqdg9rTB25EG+1liSCIjxLI7qD9YUJgNkgHsx6i90Y3o+H6kPM81tNDohcJGQeSPEWRmtrQK9ntxjAzQnSqlgRnD4R30baPUBGq8h5vPDZ8W7QKTEy9uOyqXJ/a6+LMrpJC2F/V5JK5gCB9lIDwMwRRT1RoC5DuI4r2DRZAPRsNDn3xnuxIngKuS/RoZdSxc+hwaENVTwp7UWKXxY59/pyDpQNoDydXoqW9uM1jkOQCw6+mSiiWBQrVVziKtbnDgPSfIHzRlpEAqXuvkfSJvGBYgJBAub0MoHgAyVhE6j7nkig7J4ZmBlv6C6sfACnf2YL8/krVRyKfY0l2JHAkuEGuYG9LRvOS/J0O4bVd+8kyOLLHq+KEcEYwXvFq2KNQZqv7pxHm361Jvyx9ZyccB2meU8VvA/ntNYlJtDdsVP1sxvYDaoqIqKzkDi1zc+PaTgaOofDn/12a69PhDbsCc5JjxCU7cKh/7b7zrc+T/v13SbRpy+8OGoe/9dR1q7uYc2VvTz3/BD/fvY4N25ZSV9PJ9Vagz/tOUixVGNhVzs3XrcSgGcPDHLg4AiJRAQRYc0V3Sxd0gXqmJgqsedvh2g0PP1v6GLd1X14UW8qr0Dh0VEKf7mcZctysOOsEog2eatPpL+rz6H14Qfqqqo/uPsRJf5pve32e1VVdcddf1Sin9Lf/uEZVVV96ci4Lrri6xrrvVPX3bRTK5W6qqp+5dsPq3R9XjuWfVljvXfqkrXf1Ef2HlRV1YcfOaCx3js10n2Hbvv0gydgHvlpXZ9D9cnUXSfbdEb1aEqc16dSK4hUP0fJeJXAAsRiAanuNC8fnURVSafiBPPbiERC741NFIgEhp7FKep1RyZXBiCZjNKejPKOG97I+26+ivHJIj+55+8AjIzl6WiPsXhhimy+AvimQRFL0XiC2mf06Y5+CMPpzJK3GxFBqZe/T1zjOK+CCoDzijGGgeEsR45OEolYGnWH+lBKh0ZylMp1ALK5MhOTxell87kyt7zrah786TY6U3HGJgrTcxoNj6oyOpanUqkhoWwLzitxYlQrd4lwigSaV0ncY7EbaeMWCjjkJLcoGCOUy3WeevY40YgFVbTJtIHBLAos6ZtHsVRjZKzQCmoQoVCsoqpEIjb8DTg2kKEtGaWnO834RJFMtjy9F4KlgKON9+iTsbfJB3C6K7THNJ8R9qO65/oAoztBmYn2xgr7nj6Gcx5EpkP52GCGaMSy9soeKtUGQyO5EwaEKWcoiarTkndsIMMl89u4on8RE5nStHf05M29gtedqtcH7EdVkRDpPVjZgXfJxz5Oyq+ldBrK0/OVWCTgP88PMZkpYwIz7bPjgxkS8QiX9y/Ce+X4UPaEzarEYxGi0QBVMMZQrzuGRnJcsqCNlcu7KBSqjIzlp/W7OSxlHGl/Ffse+4TswLMXGxo9Fq5txd+Kx/sZzk7vlDeuXMjxwSyHj4wTiwbTqjk4nKO9LcplSxcQWMPAYObECRZYjhyb5JcPPUU2XyHVEaNcqTM6nqdrQRtL++bRqDsGhnMnKHVqHujx/raWrWHodzV3VjmKVWOg8SpaiFCtNdiwdgl/2nuQfc8cIxa1064eHsuzcEE7q1d1k0hEGGgi7b3Snkrws3v/wVS2hPfKR25dT6lcY3yySF9PJ6v6F4VxMZQ5E1iKwWLkaMtW0ywuQ3Al9kOKUsFiTiVWyMlarcHyZQvo60kzOJwLj2trKJfrZLNlgsBw+JVxkokow6O5JsqGRsOxYvkl3PbuNdx394f50C3X8OJLY3ivVGuOgcEM8USEY03vSCsvUBSDoSRVTPQHLVuDpkE+rBjyB93jsR+bTvdFsjROzk1EBG045ncmWb2qm38+eQQRIRIYhkZyOOd54dAoN3/k5yQTUaZyZbxXolFLIV9h2/uv5ZMf3TzN2VeOT9GWjPLQ75/hwd376GiLTXun5T3A0UFA1twtGwvPt6oac0qcbccYm/wOeRkigkVPy2cVAmtYv6YP50NH2MAwOJKlUKzR253mpi0r6UwlmJwqMTlVIrBhPDcaHu+VUqmGSBi4tbrj8v6FbH3zCmKxgOHRPDUHYgUUTxRDTkaIxL+l28OD7xSdFkH5BiLXTmXx5iskRcBqK9BaVGg4x7qr+0gmIqgq1ghDI3nKhQofvnUdv733djavX8rkVInR8QLRiMU2MzhjBBuY5sGSp153fOOL7+R3991Oz+I0Y+MFMjnABji1SgKDN1+Ta7IZtmJa+Yc5jbehgG+o3u+zPEXMWdW6g5DPrlglX6iyfOkCOtMJpiaLOOd58aVRfLFGZzqBqtKZTlCbKHD46ATOe1yuTK3eOMX1LxwaQVVpb4uhqnS0xzg6MMXAcAUC52zUWXLybza+5x7dheWGE3m1OXO5gjex7s+T3oJEewBPb3eajdet4JL5SYyB977zSjZvXEZHe4xEPGDT1pX0L1+AoKy7uocNb3oD6h29i1NsuG4FvYtTgCcwQqPRoK87xdu39rOoqw1B2bL5MjZecym1ahEil8K8LRD03CGy2zUVV2eRTxtU9devRT6ts8undzdtsLMqt1TVgGilMrU0Kvn9xtg4XkVBWnIU5hRM17iKnvI9XPzV91q7hufHqXNUUWNE8b5KrGM1dL4MKiLiz1luiYhXxSYS847ovnk/JO2+SkYbclKDRs7y9jILZM70jCiOTgnI2h/JtVOHQ4kTN/vCtlXB/H1HG1FzgIj2UgvLudeoqPVEEBoyhPeXs2l7YaaKRc7dDhOnTyS3kao9QPbMidQc9T4caSzZyO2yqXyfqs7YHjt7J0dwukstG4q/JMtjtKkFdWEgz+nlaFNLlifZWPqF6tcDUH/hbbHWwRPYL+BE57i3dBI5hLraO0TwIjsaZ2sbnNPoVsUg6yv/pCy/oh2LvjoLvKiuaQeWkvwmurnyqO7CquplqtrVVCm50FZv2NP7T7yPunsRo3FqNNCLDkolisVLDTt/FWtGjkBlFcQ+CEwC94tI9vSGTTBLeviwhqwc08fjnyLpfkKCtjn6L6JIwXxW1o+9HAIUs0AeqM54Yp8XLNsxsgOvj85bQrrWT+WkE+RCOqVxIB85JG/OvDK9tqoBlgNFERmadVtsFlSZW7U7zzXP+y8IkTDv5so50pH96Ol96CbaetEI/z+N/wFLU+FCLtBvWwAAAABJRU5ErkJggg==";
function NapaBrand(){
  return(
    <img src={NAPA_LOGO_B64} alt="NAPA" style={{height:44,width:"auto",objectFit:"contain"}}/>
  );
}

// ─── INVENTORY PANEL ──────────────────────────────────────────────────────────
const INV_CATEGORIES = ["Air Filters","Batteries","Cabin Air Filters","Chemicals","Consumables","Fuel Filters","Oil Filters","Other","Wiper Blades"];

function InvPanel({customer,onUpdate}){
  const [items,setItems]=useState(customer.inventory||[]);
  const [np,setNp]=useState({partNum:"",description:"",parLevel:"",currentStock:"",category:"Oil Filters"});
  const [editingId,setEditingId]=useState(null);
  const [editBuf,setEditBuf]=useState({partNum:"",description:"",parLevel:"",category:""});
  const [collapsed,setCollapsed]=useState(()=>INV_CATEGORIES.reduce((a,c)=>({...a,[c]:true}),{}));

  const save=upd=>{setItems(upd);onUpdate({...customer,inventory:upd});};
  const add=()=>{
    if(!np.description)return;
    save([...items,{id:`inv-${Date.now()}`,partNum:np.partNum,description:np.description,parLevel:parseInt(np.parLevel)||0,currentStock:parseInt(np.currentStock)||0,category:np.category||"Other"}]);
    setNp(p=>({...p,partNum:"",description:"",parLevel:"",currentStock:""}));
  };
  const updateStock=(id,val)=>save(items.map(i=>i.id===id?{...i,currentStock:parseInt(val)||0}:i));
  const remove=id=>save(items.filter(i=>i.id!==id));
  const saveEdit=id=>{
    save(items.map(i=>i.id===id?{...i,partNum:editBuf.partNum,description:editBuf.description,parLevel:parseInt(editBuf.parLevel)||i.parLevel,category:editBuf.category||i.category}:i));
    setEditingId(null);
  };
  const toggleCollapse=cat=>setCollapsed(c=>({...c,[cat]:!c[cat]}));

  // Group items by category
  const grouped = INV_CATEGORIES.reduce((acc,cat)=>{
    acc[cat]=items.filter(i=>(i.category||"Other")===cat).sort((a,b)=>a.description.localeCompare(b.description)||((a.partNum||"").localeCompare(b.partNum||"")));
    return acc;
  },{});

  const totalItems=items.length;
  const orderItems=items.filter(i=>i.currentStock<i.parLevel);

  return(
    <div style={{marginTop:14,padding:14,background:"#f8fafc",borderRadius:10,border:"1.5px solid #e2e8f0"}}>
      <div style={{fontWeight:800,fontSize:13,color:"#1e293b",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        📦 Inventory ({totalItems} items)
        {orderItems.length>0&&<span style={{background:"#fee2e2",color:"#991b1b",padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700}}>⚠️ {orderItems.length} need reorder</span>}
      </div>

      {/* Category sections */}
      {INV_CATEGORIES.map(cat=>{
        const catItems=grouped[cat];
        if(catItems.length===0)return null;
        const catOrderItems=catItems.filter(i=>i.currentStock<i.parLevel);
        const isOpen=!collapsed[cat];
        return(
          <div key={cat} style={{marginBottom:10,border:"1.5px solid #e2e8f0",borderRadius:8,overflow:"hidden"}}>
            {/* Category header - clickable to collapse */}
            <div onClick={()=>toggleCollapse(cat)} style={{background:NAPA_PANEL,padding:"7px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",userSelect:"none",borderLeft:`3px solid ${NAPA_YELLOW}`}}>
              <div style={{fontWeight:700,fontSize:12,color:NAPA_NAVY}}>{cat} <span style={{color:"#64748b",fontWeight:500}}>({catItems.length})</span></div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                {catOrderItems.length>0&&<span style={{background:"#fee2e2",color:"#991b1b",padding:"1px 7px",borderRadius:20,fontSize:10,fontWeight:700}}>ORDER {catOrderItems.reduce((s,i)=>s+(i.parLevel-i.currentStock),0)}</span>}
                <span style={{color:"#64748b",fontSize:12}}>{isOpen?"▼":"▶"}</span>
              </div>
            </div>
            {/* Category items */}
            {isOpen&&(
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",minWidth:480,borderCollapse:"collapse",fontSize:12}}>
                  <thead><tr style={{background:NAPA_NAVY}}>{["Part #","Description","Par","Stock","Order","Actions"].map(h=><th key={h} style={{padding:"5px 8px",textAlign:"left",fontWeight:700,color:"#cbd5e1",fontSize:11}}>{h}</th>)}</tr></thead>
                  <tbody>{catItems.map(item=>{
                    const low=item.currentStock<item.parLevel;
                    const orderQty=low?item.parLevel-item.currentStock:0;
                    const isEditing=editingId===item.id;
                    return<tr key={item.id} style={{background:isEditing?"#f0f9ff":low?"#fff7ed":"#fff",borderBottom:"1px solid #f1f5f9"}}>
                      <td style={{padding:"5px 7px"}}>{isEditing?<input value={editBuf.partNum} onChange={e=>setEditBuf(b=>({...b,partNum:e.target.value}))} style={{width:70,border:"1.5px solid #38bdf8",borderRadius:5,padding:"2px 5px",fontSize:11}}/>:<span style={{color:"#64748b"}}>{item.partNum||"—"}</span>}</td>
                      <td style={{padding:"5px 7px"}}>{isEditing?<input value={editBuf.description} onChange={e=>setEditBuf(b=>({...b,description:e.target.value}))} style={{width:110,border:"1.5px solid #38bdf8",borderRadius:5,padding:"2px 5px",fontSize:11}}/>:<span style={{fontWeight:600,color:"#1f2937"}}>{item.description}</span>}</td>
                      <td style={{padding:"5px 7px",textAlign:"center"}}>{isEditing?<input type="number" value={editBuf.parLevel} min="1" onChange={e=>setEditBuf(b=>({...b,parLevel:e.target.value}))} style={{width:44,border:"1.5px solid #38bdf8",borderRadius:5,padding:"2px 4px",fontSize:11,textAlign:"center"}}/>:<span style={{color:"#64748b"}}>{item.parLevel}</span>}</td>
                      <td style={{padding:"5px 7px"}}>{!isEditing&&<input type="number" value={item.currentStock} min="0" onChange={e=>updateStock(item.id,e.target.value)} style={{width:52,border:"1.5px solid #d1d5db",borderRadius:6,padding:"2px 5px",fontSize:12,textAlign:"center"}}/>}{isEditing&&<span style={{color:"#64748b",fontSize:12,padding:"0 6px"}}>{item.currentStock}</span>}</td>
                      <td style={{padding:"5px 7px",textAlign:"center",fontWeight:800,fontSize:13,color:low?"#cc0000":"#16a34a"}}>{low?orderQty:"—"}</td>
                      <td style={{padding:"5px 7px",whiteSpace:"nowrap"}}>
                        {isEditing
                          ?<><button onClick={()=>saveEdit(item.id)} style={{background:"none",border:"none",color:"#16a34a",cursor:"pointer",fontSize:13,fontWeight:700,marginRight:4}}>✓</button><button onClick={()=>setEditingId(null)} style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:13}}>✕</button></>
                          :<><button onClick={()=>{setEditingId(item.id);setEditBuf({partNum:item.partNum||"",description:item.description||"",parLevel:item.parLevel,category:item.category||cat});}} style={{background:"none",border:"none",color:"#2563eb",cursor:"pointer",fontSize:12,marginRight:2}}>✏️</button><button onClick={()=>remove(item.id)} style={{background:"none",border:"none",color:"#dc2626",cursor:"pointer",fontSize:14,fontWeight:700}}>×</button></>}
                      </td>
                    </tr>;
                  })}</tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      {items.length===0&&<div style={{color:"#94a3b8",fontSize:13,textAlign:"center",padding:"12px 0"}}>No inventory items yet — add parts below</div>}

      {/* Add new item */}
      <div style={{marginTop:12,padding:"10px 12px",background:"#fff",borderRadius:8,border:"1.5px solid #e2e8f0"}}>
        <div style={{fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Add New Item</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(90px,1fr))",gap:6,alignItems:"end"}}>
          <div><label style={{...lbl,fontSize:10}}>Category</label>
            <select value={np.category} onChange={e=>setNp(p=>({...p,category:e.target.value}))} style={{...inp,fontSize:11}}>
              {INV_CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div><label style={{...lbl,fontSize:10}}>Part #</label><input value={np.partNum} onChange={e=>setNp(p=>({...p,partNum:e.target.value}))} placeholder="21348" style={{...inp,fontSize:12}}/></div>
          <div><label style={{...lbl,fontSize:10}}>Description</label><input value={np.description} onChange={e=>setNp(p=>({...p,description:e.target.value}))} placeholder="Oil Filter" style={{...inp,fontSize:12}}/></div>
          <div><label style={{...lbl,fontSize:10}}>Par</label><input type="number" value={np.parLevel} onChange={e=>setNp(p=>({...p,parLevel:e.target.value}))} placeholder="12" style={{...inp,fontSize:12}}/></div>
          <div><label style={{...lbl,fontSize:10}}>Stock</label><input type="number" value={np.currentStock} onChange={e=>setNp(p=>({...p,currentStock:e.target.value}))} placeholder="0" style={{...inp,fontSize:12}}/></div>
          <button onClick={add} style={{...btn(NAPA_NAVY),padding:"8px 12px",fontSize:12,marginTop:16}}>+ Add</button>
        </div>
      </div>
      <ReorderHistoryPanel customer={customer} onUpdate={onUpdate}/>
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
        <div style={{background:NAPA_NAVY,padding:"18px 24px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`3px solid ${NAPA_YELLOW}`}}>
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
        <div style={{background:NAPA_NAVY,padding:"20px 24px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`3px solid ${NAPA_YELLOW}`}}>
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
        <div style={{background:NAPA_NAVY,padding:"20px 24px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`3px solid ${NAPA_YELLOW}`}}>
          <div><div style={{color:"#fff",fontWeight:800,fontSize:18}}>📊 Territory Dashboard</div><div style={{color:"#94a3b8",fontSize:12,marginTop:2}}>North Texas Sales Territory Overview</div></div>
          <button onClick={onClose} style={{color:"#94a3b8",background:"none",border:"none",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{padding:24}}>
          {/* KPI row */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:12,marginBottom:24}}>
            {[
              {label:"Total Accounts",value:customers.length,icon:"🏢",color:NAPA_NAVY,border:NAPA_NAVY},
              {label:"Active Customers",value:activeCustomers.length,icon:"✅",color:"#16a34a",border:"#16a34a"},
              {label:"Monthly Spend",value:`$${totalSpend.toLocaleString()}`,icon:"💰",color:NAPA_BLUE,border:NAPA_BLUE},
              {label:"Open Follow-Ups",value:openFollowups.length,icon:"📅",color:"#d97706",border:NAPA_YELLOW},
              {label:"Reorders Needed",value:reorderCount,icon:"🔴",color:reorderCount>0?NAPA_RED:"#16a34a",border:reorderCount>0?NAPA_RED:"#16a34a"},
            ].map(k=>(
              <div key={k.label} style={{background:"#fff",borderRadius:12,padding:"16px 14px",textAlign:"center",border:"1.5px solid #e2e8f0",borderTop:`4px solid ${k.border}`}}>
                <div style={{fontSize:24,marginBottom:4}}>{k.icon}</div>
                <div style={{fontWeight:900,fontSize:22,color:k.color,lineHeight:1}}>{k.value}</div>
                <div style={{fontSize:11,color:"#64748b",fontWeight:600,marginTop:4,textTransform:"uppercase",letterSpacing:"0.04em"}}>{k.label}</div>
              </div>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>
            {/* Top accounts */}
            <div style={{border:"1.5px solid #e2e8f0",borderRadius:12,overflow:"hidden"}}>
              <div style={{background:NAPA_NAVY,padding:"12px 16px",fontWeight:800,fontSize:13,color:"#fff",borderBottom:`2px solid ${NAPA_YELLOW}`}}>💰 Top Accounts by Monthly Spend</div>
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
              <div style={{background:NAPA_NAVY,padding:"12px 16px",fontWeight:800,fontSize:13,color:"#fff",borderBottom:`2px solid ${NAPA_YELLOW}`}}>📅 Upcoming Follow-Ups</div>
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
            <div style={{background:NAPA_NAVY,padding:"12px 16px",fontWeight:800,fontSize:13,color:"#fff",borderBottom:`2px solid ${NAPA_YELLOW}`}}>📍 Accounts by Town</div>
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
            <div style={{background:NAPA_NAVY,padding:"12px 16px",fontWeight:800,fontSize:13,color:"#fff",borderBottom:`2px solid ${NAPA_YELLOW}`}}>💵 Spend Distribution</div>
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

          {/* Competitor Signal Dashboard */}
          <div style={{marginTop:20,border:"1.5px solid #e2e8f0",borderRadius:12,overflow:"hidden"}}>
            <div style={{background:NAPA_NAVY,padding:"12px 16px",fontWeight:800,fontSize:13,color:"#fff",borderBottom:`2px solid ${NAPA_YELLOW}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span>⚡ Competitor Signal Dashboard</span>
              <span style={{fontSize:11,fontWeight:600,color:"#94a3b8"}}>{customers.filter(c=>c.competitor).length} accounts flagged</span>
            </div>
            {!customers.some(c=>c.competitor)&&<div style={{padding:"20px 16px",color:"#94a3b8",fontSize:13,textAlign:"center"}}>No competitor data yet — add competitor fields in customer profiles to see win/loss intelligence</div>}
            {customers.some(c=>c.competitor)&&(
              <div>
                {/* Summary tiles */}
                <div style={{padding:"12px 16px",display:"flex",gap:10,flexWrap:"wrap",borderBottom:"1px solid #f1f5f9"}}>
                  {COMPETITORS.filter(Boolean).map(comp=>{
                    const accs=customers.filter(c=>c.competitor===comp);
                    if(!accs.length)return null;
                    const hpAccs=accs.filter(c=>c.priority==="High");
                    return(
                      <div key={comp} style={{background:"#fff7ed",border:"1.5px solid #fed7aa",borderRadius:10,padding:"10px 14px",textAlign:"center",minWidth:110}}>
                        <div style={{fontWeight:900,fontSize:22,color:"#c2410c"}}>{accs.length}</div>
                        <div style={{fontSize:12,color:"#c2410c",fontWeight:700}}>{comp}</div>
                        {hpAccs.length>0&&<div style={{fontSize:11,color:"#dc2626",fontWeight:600,marginTop:3}}>🔴 {hpAccs.length} High Pri</div>}
                      </div>
                    );
                  })}
                </div>
                {/* Account list by competitor */}
                {COMPETITORS.filter(Boolean).map(comp=>{
                  const accs=customers.filter(c=>c.competitor===comp).sort((a,b)=>a.priority==="High"?-1:b.priority==="High"?1:0);
                  if(!accs.length)return null;
                  return(
                    <div key={comp}>
                      <div style={{padding:"8px 16px",background:"#fff7ed",fontWeight:700,fontSize:12,color:"#c2410c",borderBottom:"1px solid #fed7aa"}}>vs {comp} ({accs.length})</div>
                      {accs.map(c=>(
                        <div key={c.id} onClick={()=>{onClose();onSelectCustomer(c);}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 16px",borderBottom:"1px solid #f8f8f8",cursor:"pointer",background:"#fff"}} onMouseEnter={e=>e.currentTarget.style.background="#fff7ed"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:700,fontSize:13,color:"#1e293b"}}>{c.name}</div>
                            <div style={{fontSize:11,color:"#64748b"}}>{c.town} · {c.type}{c.contact?` · ${c.contact}`:""}</div>
                          </div>
                          <div style={{display:"flex",gap:6,alignItems:"center"}}>
                            <PriBadge p={c.priority}/>
                            {c.status&&<StsBadge s={c.status}/>}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Neglected Accounts in Dashboard */}
          {(()=>{
            const cutoff=new Date();cutoff.setDate(cutoff.getDate()-60);
            const cutoffStr=cutoff.toISOString().split("T")[0];
            const neglected=customers.filter(c=>{
              const last=c.lastVisit&&c.lastCall?(c.lastVisit>c.lastCall?c.lastVisit:c.lastCall):(c.lastVisit||c.lastCall||"");
              return(c.status==="Customer"||c.status==="Active")&&(!last||last<cutoffStr);
            });
            if(!neglected.length)return null;
            return(
              <div style={{marginTop:20,border:"1.5px solid #fed7aa",borderRadius:12,overflow:"hidden"}}>
                <div style={{background:"#ea580c",padding:"12px 16px",fontWeight:800,fontSize:13,color:"#fff",borderBottom:"2px solid #f97316",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span>⏰ Neglected Customers (60+ days no contact)</span>
                  <span style={{background:"rgba(255,255,255,0.2)",padding:"2px 10px",borderRadius:20,fontSize:12}}>{neglected.length}</span>
                </div>
                {neglected.map(c=>{
                  const last=c.lastVisit&&c.lastCall?(c.lastVisit>c.lastCall?c.lastVisit:c.lastCall):(c.lastVisit||c.lastCall||"");
                  const days=last?Math.floor((new Date()-new Date(last+"T12:00:00"))/(1000*60*60*24)):null;
                  return(
                    <div key={c.id} onClick={()=>{onClose();onSelectCustomer(c);}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 16px",borderBottom:"1px solid #fff7ed",cursor:"pointer",background:"#fff"}} onMouseEnter={e=>e.currentTarget.style.background="#fff7ed"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                      <div>
                        <div style={{fontWeight:700,fontSize:13,color:"#1e293b"}}>{c.name}</div>
                        <div style={{fontSize:11,color:"#64748b"}}>{c.town} · {c.type}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:12,fontWeight:700,color:"#ea580c"}}>{days?`${days}d no contact`:"Never logged"}</div>
                        <PriBadge p={c.priority}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Rep assignment */}
          {REPS.filter(Boolean).some(r=>customers.some(c=>c.repName===r))&&(
            <div style={{marginTop:20,border:"1.5px solid #e2e8f0",borderRadius:12,overflow:"hidden"}}>
              <div style={{background:NAPA_NAVY,padding:"12px 16px",fontWeight:800,fontSize:13,color:"#fff",borderBottom:`2px solid ${NAPA_YELLOW}`}}>👤 Accounts by Rep</div>
              <div style={{padding:16,display:"flex",gap:10,flexWrap:"wrap"}}>
                {REPS.filter(Boolean).map(rep=>{
                  const accs=customers.filter(c=>c.repName===rep);
                  if(!accs.length)return null;
                  const spend=accs.reduce((s,c)=>s+(parseFloat(c.monthlySpend)||0),0);
                  return<div key={rep} style={{background:"#f0f9ff",border:"1.5px solid #bae6fd",borderRadius:10,padding:"12px 16px",minWidth:140}}>
                    <div style={{fontWeight:800,fontSize:14,color:"#0c4a6e"}}>{rep}</div>
                    <div style={{fontSize:12,color:"#0369a1",marginTop:2}}>{accs.length} accounts</div>
                    {spend>0&&<div style={{fontSize:12,color:"#16a34a",fontWeight:600}}>${spend.toLocaleString()}/mo</div>}
                  </div>;
                })}
              </div>
            </div>
          )}
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
      <div style={{background:NAPA_NAVY,padding:"12px 16px",fontWeight:800,fontSize:13,color:"#fff",borderBottom:`2px solid ${NAPA_YELLOW}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        {title}<span style={{background:NAPA_YELLOW,color:NAPA_NAVY,borderRadius:20,fontSize:11,fontWeight:800,padding:"2px 8px"}}>{items.length}</span>
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
        <div style={{background:NAPA_NAVY,padding:"20px 24px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`3px solid ${NAPA_YELLOW}`}}>
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
  const [f,setF]=useState({name:"",type:"Auto Repair",town:"",address:"",phone:"",contact:"",email:"",priority:"High",status:"Prospect",acctNum:"",monthlySpend:"",notes:"",competitor:"",repName:"",lostReason:""});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const save=()=>{if(!f.name.trim())return;const full=f.address&&f.town?`${f.address}, ${f.town}, TX`:f.address;onAdd({...f,id:Date.now(),fullAddress:full,rating:"",reviews:0,supplier:"",lastVisit:"",lastCall:"",nextFollowUp:"",relScore:"",isStocking:false,inventory:[],callLog:[],spendHistory:[],reorderHistory:[],competitor:"",repName:"",lostReason:""});onClose();};
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:560,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,0.3)"}}>
        <div style={{background:NAPA_NAVY,padding:"18px 24px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`3px solid ${NAPA_YELLOW}`}}>
          <div style={{color:"#fff",fontWeight:800,fontSize:16}}>➕ Add New Customer</div>
          <button onClick={onClose} style={{color:"#94a3b8",background:"none",border:"none",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{padding:24,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14}}>
          <div style={{gridColumn:"1/-1"}}><Fld label="Business Name *"><input value={f.name} onChange={e=>set("name",e.target.value)} style={inp} placeholder="Business name"/></Fld></div>
          <Fld label="Type"><input value={f.type} onChange={e=>set("type",e.target.value)} style={inp}/></Fld>
          <Fld label="Town"><input value={f.town} onChange={e=>set("town",e.target.value)} style={inp} placeholder="Pilot Point"/></Fld>
          <div style={{gridColumn:"1/-1"}}><Fld label="Address"><input value={f.address} onChange={e=>set("address",e.target.value)} style={inp} placeholder="123 Main St"/></Fld></div>
          <Fld label="Phone"><input value={f.phone} onChange={e=>set("phone",e.target.value)} style={inp}/></Fld>
          <Fld label="Contact Person"><input value={f.contact} onChange={e=>set("contact",e.target.value)} style={inp}/></Fld>
          <Fld label="Email"><input value={f.email} onChange={e=>set("email",e.target.value)} style={inp} type="email"/></Fld>
          <Fld label="Acct # (POS)"><input value={f.acctNum} onChange={e=>set("acctNum",e.target.value)} style={inp}/></Fld>
          <Fld label="Est. Monthly Spend">
          <select value={f.monthlySpend||""} onChange={e=>set("monthlySpend",e.target.value)} style={{...inp,color:SPEND_OPTIONS.find(o=>o.value===(f.monthlySpend||""))?.color||"#6b7280",fontWeight:600}}>
            {SPEND_OPTIONS.map(o=><option key={o.value} value={o.value} style={{color:o.color}}>{o.label}</option>)}
          </select>
        </Fld>
          <Fld label="Priority"><select value={f.priority} onChange={e=>set("priority",e.target.value)} style={{...inp}}>{PRIORITIES.map(p=><option key={p}>{p}</option>)}</select></Fld>
          <Fld label="Status"><select value={f.status} onChange={e=>set("status",e.target.value)} style={{...inp}}>{STATUSES.filter(Boolean).map(s=><option key={s}>{s}</option>)}</select></Fld>
          <Fld label="🏪 Competitor"><select value={f.competitor||""} onChange={e=>set("competitor",e.target.value)} style={{...inp}}>{COMPETITORS.map(c=><option key={c} value={c}>{c||"— Select —"}</option>)}</select></Fld>
          <Fld label="👤 Sales Rep"><select value={f.repName||""} onChange={e=>set("repName",e.target.value)} style={{...inp}}>{REPS.map(r=><option key={r} value={r}>{r||"— Assign —"}</option>)}</select></Fld>
          <div style={{gridColumn:"1/-1"}}><Fld label="Notes"><textarea value={f.notes} onChange={e=>set("notes",e.target.value)} rows={2} style={{...inp,resize:"vertical"}}/></Fld></div>
          <div style={{gridColumn:"1/-1",display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button onClick={onClose} style={{...btn("#f1f5f9","#374151"),border:"1.5px solid #d1d5db"}}>Cancel</button>
            <button onClick={save} style={btn(NAPA_NAVY)}>Add Customer</button>
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── CALL LOG PANEL ──────────────────────────────────────────────────────────
function CallLogPanel({f,set}){
  const [newEntry,setNewEntry]=useState("");
  const [newDate,setNewDate]=useState(new Date().toISOString().split("T")[0]);
  const logs=(f.callLog||[]).slice().sort((a,b)=>b.date<a.date?-1:1);
  const addLog=()=>{
    if(!newEntry.trim())return;
    const entry={id:Date.now(),date:newDate,note:newEntry.trim(),rep:f.repName||""};
    set("callLog",[...(f.callLog||[]),entry]);
    setNewEntry("");
    setNewDate(new Date().toISOString().split("T")[0]);
  };
  const removeLog=id=>set("callLog",(f.callLog||[]).filter(l=>l.id!==id));
  return(
    <div style={{marginBottom:14,padding:14,background:"#f8fafc",borderRadius:10,border:"1.5px solid #e2e8f0"}}>
      <div style={{fontWeight:700,fontSize:13,color:"#1e293b",marginBottom:10}}>📞 Call Log <span style={{color:"#94a3b8",fontWeight:500,fontSize:12}}>({logs.length} entries)</span></div>
      {/* Add entry */}
      <div style={{display:"grid",gridTemplateColumns:"120px 1fr auto",gap:6,marginBottom:10,alignItems:"end"}}>
        <div>
          <label style={{display:"block",fontSize:10,fontWeight:700,color:"#6b7280",textTransform:"uppercase",marginBottom:3}}>Date</label>
          <input type="date" value={newDate} onChange={e=>setNewDate(e.target.value)} style={{...inp,fontSize:12}}/>
        </div>
        <div>
          <label style={{display:"block",fontSize:10,fontWeight:700,color:"#6b7280",textTransform:"uppercase",marginBottom:3}}>Notes</label>
          <input value={newEntry} onChange={e=>setNewEntry(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addLog()} placeholder="What was discussed..." style={{...inp,fontSize:12}}/>
        </div>
        <button onClick={addLog} style={{padding:"8px 12px",background:NAPA_NAVY,border:"none",borderRadius:8,color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",marginTop:16}}>+ Log</button>
      </div>
      {/* Log entries */}
      {logs.length===0&&<div style={{color:"#94a3b8",fontSize:12,textAlign:"center",padding:"8px 0"}}>No calls logged yet</div>}
      <div style={{maxHeight:200,overflowY:"auto"}}>
        {logs.map(log=>(
          <div key={log.id} style={{padding:"8px 10px",background:"#fff",borderRadius:8,marginBottom:6,border:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
            <div style={{flex:1}}>
              <div style={{fontSize:11,color:"#64748b",fontWeight:600,marginBottom:2}}>{new Date(log.date+"T12:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"})}{log.rep?` · ${log.rep}`:""}</div>
              <div style={{fontSize:13,color:"#1e293b",lineHeight:1.4}}>{log.note}</div>
            </div>
            <button onClick={()=>removeLog(log.id)} style={{background:"none",border:"none",color:"#dc2626",cursor:"pointer",fontSize:16,fontWeight:700,flexShrink:0,padding:0}}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SPEND HISTORY PANEL ─────────────────────────────────────────────────────
function SpendHistoryPanel({f,set}){
  const [newMonth,setNewMonth]=useState(()=>{const d=new Date();return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;});
  const [newAmt,setNewAmt]=useState("");
  const history=(f.spendHistory||[]).slice().sort((a,b)=>b.month<a.month?-1:1).slice(0,12);
  const addEntry=()=>{
    if(!newAmt||isNaN(parseFloat(newAmt)))return;
    const existing=(f.spendHistory||[]).filter(e=>e.month!==newMonth);
    set("spendHistory",[...existing,{month:newMonth,amount:parseFloat(newAmt)}]);
    setNewAmt("");
  };
  const maxAmt=Math.max(...history.map(e=>e.amount),1);
  return(
    <div style={{marginBottom:14,padding:14,background:"#f8fafc",borderRadius:10,border:"1.5px solid #e2e8f0"}}>
      <div style={{fontWeight:700,fontSize:13,color:"#1e293b",marginBottom:10}}>📈 Monthly Spend History</div>
      <div style={{display:"grid",gridTemplateColumns:"140px 1fr auto",gap:6,marginBottom:10,alignItems:"end"}}>
        <div>
          <label style={{display:"block",fontSize:10,fontWeight:700,color:"#6b7280",textTransform:"uppercase",marginBottom:3}}>Month</label>
          <input type="month" value={newMonth} onChange={e=>setNewMonth(e.target.value)} style={{...inp,fontSize:12}}/>
        </div>
        <div>
          <label style={{display:"block",fontSize:10,fontWeight:700,color:"#6b7280",textTransform:"uppercase",marginBottom:3}}>Amount ($)</label>
          <input type="number" value={newAmt} onChange={e=>setNewAmt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addEntry()} placeholder="0" style={{...inp,fontSize:12}}/>
        </div>
        <button onClick={addEntry} style={{padding:"8px 12px",background:NAPA_NAVY,border:"none",borderRadius:8,color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",marginTop:16}}>+ Add</button>
      </div>
      {history.length===0&&<div style={{color:"#94a3b8",fontSize:12,textAlign:"center",padding:"8px 0"}}>No spend history yet</div>}
      {history.length>0&&(
        <div>
          {history.map(e=>(
            <div key={e.month} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
              <div style={{fontSize:11,color:"#64748b",minWidth:55,fontWeight:600}}>{e.month.replace("-","/")}</div>
              <div style={{flex:1,background:"#e2e8f0",borderRadius:4,height:14,overflow:"hidden"}}>
                <div style={{background:"#0891b2",height:"100%",width:`${Math.round((e.amount/maxAmt)*100)}%`,borderRadius:4,transition:"width 0.3s"}}/>
              </div>
              <div style={{fontSize:12,fontWeight:700,color:"#0891b2",minWidth:55,textAlign:"right"}}>${e.amount.toLocaleString()}</div>
              <button onClick={()=>set("spendHistory",(f.spendHistory||[]).filter(h=>h.month!==e.month))} style={{background:"none",border:"none",color:"#dc2626",cursor:"pointer",fontSize:14,fontWeight:700,padding:0}}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── REORDER HISTORY PANEL ────────────────────────────────────────────────────
function ReorderHistoryPanel({customer,onUpdate}){
  const [date,setDate]=useState(new Date().toISOString().split("T")[0]);
  const [items,setItems]=useState("");
  const [qty,setQty]=useState("");
  const history=(customer.reorderHistory||[]).slice().sort((a,b)=>b.date<a.date?-1:1);
  const addReorder=()=>{
    if(!items.trim())return;
    const entry={id:Date.now(),date,items:items.trim(),qty:qty||""};
    onUpdate({...customer,reorderHistory:[...(customer.reorderHistory||[]),entry]});
    setItems(""); setQty("");
  };
  const removeReorder=id=>onUpdate({...customer,reorderHistory:(customer.reorderHistory||[]).filter(r=>r.id!==id)});
  return(
    <div style={{marginTop:14,padding:14,background:"#f0fdf4",borderRadius:10,border:"1.5px solid #bbf7d0"}}>
      <div style={{fontWeight:700,fontSize:13,color:"#1e293b",marginBottom:10}}>📋 Reorder History</div>
      <div style={{display:"grid",gridTemplateColumns:"110px 1fr 80px auto",gap:6,marginBottom:10,alignItems:"end"}}>
        <div><label style={{display:"block",fontSize:10,fontWeight:700,color:"#6b7280",textTransform:"uppercase",marginBottom:3}}>Date</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{...inp,fontSize:12}}/></div>
        <div><label style={{display:"block",fontSize:10,fontWeight:700,color:"#6b7280",textTransform:"uppercase",marginBottom:3}}>Items Restocked</label><input value={items} onChange={e=>setItems(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addReorder()} placeholder="21348 Oil Filter, 78-8C Battery" style={{...inp,fontSize:12}}/></div>
        <div><label style={{display:"block",fontSize:10,fontWeight:700,color:"#6b7280",textTransform:"uppercase",marginBottom:3}}>Qty</label><input value={qty} onChange={e=>setQty(e.target.value)} placeholder="12" style={{...inp,fontSize:12}}/></div>
        <button onClick={addReorder} style={{padding:"8px 10px",background:"#16a34a",border:"none",borderRadius:8,color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",marginTop:16}}>+ Log</button>
      </div>
      {history.length===0&&<div style={{color:"#94a3b8",fontSize:12,textAlign:"center",padding:"6px 0"}}>No reorder history yet</div>}
      <div style={{maxHeight:160,overflowY:"auto"}}>
        {history.map(r=>(
          <div key={r.id} style={{padding:"7px 10px",background:"#fff",borderRadius:8,marginBottom:5,border:"1px solid #d1fae5",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontSize:11,color:"#16a34a",fontWeight:600,marginBottom:1}}>{new Date(r.date+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}{r.qty?` · Qty: ${r.qty}`:""}</div>
              <div style={{fontSize:12,color:"#1e293b"}}>{r.items}</div>
            </div>
            <button onClick={()=>removeReorder(r.id)} style={{background:"none",border:"none",color:"#dc2626",cursor:"pointer",fontSize:14,fontWeight:700,padding:0}}>×</button>
          </div>
        ))}
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
        <div style={{background:NAPA_NAVY,padding:"20px 24px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start",borderBottom:`3px solid ${NAPA_YELLOW}`}}>
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
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12}}>
              <div style={{gridColumn:"1/-1"}}><Fld label="Business Name"><input value={f.name||""} onChange={e=>set("name",e.target.value)} style={inp}/></Fld></div>
              <Fld label="Address"><input value={f.address||""} onChange={e=>set("address",e.target.value)} style={inp}/></Fld>
              <Fld label="Town"><input value={f.town||""} onChange={e=>set("town",e.target.value)} style={inp}/></Fld>
              <Fld label="Phone"><input value={f.phone||""} onChange={e=>set("phone",e.target.value)} style={inp}/></Fld>
              <Fld label="Acct # (POS)"><input value={f.acctNum||""} onChange={e=>set("acctNum",e.target.value)} style={inp} placeholder="Assign from POS"/></Fld>
            </div>
            {f.fullAddress&&<div style={{marginTop:10}}><AddrLink addr={f.address&&f.town?`${f.address}, ${f.town}, TX`:f.fullAddress}/></div>}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:14}}>
            <Fld label="Contact Person"><input value={f.contact||""} onChange={e=>set("contact",e.target.value)} style={inp}/></Fld>
            <Fld label="Email"><input value={f.email||""} onChange={e=>set("email",e.target.value)} style={inp} type="email"/></Fld>
            <Fld label="Current Supplier">
              <select value={f.supplier||""} onChange={e=>set("supplier",e.target.value)} style={{...inp}}>
                {["","NAPA PP","O'Reilly","AutoZone","Parts Plus","Carquest","NAPA","Worldpac","Dealership","Other"].map(s=><option key={s} value={s}>{s||"— Select —"}</option>)}
              </select>
            </Fld>
            <Fld label="Est. Monthly Spend">
              <select value={f.monthlySpend||""} onChange={e=>set("monthlySpend",e.target.value)} style={{...inp,color:SPEND_OPTIONS.find(o=>o.value===(f.monthlySpend||""))?.color||"#6b7280",fontWeight:600}}>
                {SPEND_OPTIONS.map(o=><option key={o.value} value={o.value} style={{color:o.color,fontWeight:600}}>{o.label}</option>)}
              </select>
            </Fld>
            <Fld label="Last Visit"><input value={f.lastVisit||""} onChange={e=>{set("lastVisit",e.target.value);if(e.target.value){const d=new Date(e.target.value+"T12:00:00");d.setDate(d.getDate()+14);set("nextFollowUp",d.toISOString().split("T")[0]);}}} style={inp} type="date"/></Fld>
            <Fld label="Last Call"><input value={f.lastCall||""} onChange={e=>{set("lastCall",e.target.value);if(e.target.value){const d=new Date(e.target.value+"T12:00:00");d.setDate(d.getDate()+14);set("nextFollowUp",d.toISOString().split("T")[0]);}}} style={inp} type="date"/></Fld>
            <Fld label="Next Follow-Up"><input value={f.nextFollowUp||""} onChange={e=>set("nextFollowUp",e.target.value)} style={inp} type="date"/></Fld>
            <Fld label="Status"><select value={f.status||""} onChange={e=>set("status",e.target.value)} style={{...inp}}>{STATUSES.map(s=><option key={s} value={s}>{s||"— Select —"}</option>)}</select></Fld>
            <Fld label="Priority"><select value={f.priority} onChange={e=>set("priority",e.target.value)} style={{...inp}}>{PRIORITIES.map(p=><option key={p}>{p}</option>)}</select></Fld>
            <Fld label="Relationship Score (1–10)"><input value={f.relScore||""} onChange={e=>set("relScore",e.target.value)} style={inp} type="number" min="1" max="10" placeholder="1–10"/></Fld>
          </div>
          <div style={{marginBottom:14}}><Fld label="📝 Notes"><textarea value={f.notes||""} onChange={e=>set("notes",e.target.value)} rows={3} style={{...inp,resize:"vertical"}}/></Fld></div>

          {/* New fields */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:14}}>
            <Fld label="🏪 Competitor (Current Supplier)">
              <select value={f.competitor||""} onChange={e=>set("competitor",e.target.value)} style={{...inp}}>
                {COMPETITORS.map(c=><option key={c} value={c}>{c||"— Select —"}</option>)}
              </select>
            </Fld>
            <Fld label="👤 Sales Rep">
              <select value={f.repName||""} onChange={e=>set("repName",e.target.value)} style={{...inp}}>
                {REPS.map(r=><option key={r} value={r}>{r||"— Assign Rep —"}</option>)}
              </select>
            </Fld>
            {(f.status==="Cold"||f.status==="Not Interested")&&(
              <div style={{gridColumn:"1/-1"}}>
                <Fld label="❌ Lost Reason">
                  <select value={f.lostReason||""} onChange={e=>set("lostReason",e.target.value)} style={{...inp}}>
                    {LOST_REASONS.map(r=><option key={r} value={r}>{r||"— Select Reason —"}</option>)}
                  </select>
                </Fld>
              </div>
            )}
          </div>

          {/* Monthly Spend History */}
          <SpendHistoryPanel f={f} set={set}/>

          {/* Call Log */}
          <CallLogPanel f={f} set={set}/>

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
              <button onClick={save} style={btn(NAPA_NAVY)}>Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── QUICK VISIT LOG ─────────────────────────────────────────────────────────
function QuickVisitLog({customer,onSave,onClose}){
  const [note,setNote]=useState("");
  const [visitDate,setVisitDate]=useState(today());
  const [followUp,setFollowUp]=useState(()=>{const d=new Date();d.setDate(d.getDate()+14);return d.toISOString().split("T")[0];});
  const save=()=>{
    if(!note.trim())return;
    const entry={id:Date.now(),date:visitDate,note:`✅ VISIT: ${note.trim()}`,rep:customer.repName||""};
    const updated={...customer,lastVisit:visitDate,nextFollowUp:followUp,callLog:[...(customer.callLog||[]),entry]};
    onSave(updated);
    onClose();
  };
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:0}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"#fff",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:560,padding:24,paddingBottom:32,boxShadow:"0 -8px 40px rgba(0,0,0,0.25)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div>
            <div style={{fontWeight:800,fontSize:16,color:NAPA_NAVY}}>⚡ Quick Visit Log</div>
            <div style={{fontSize:12,color:"#64748b",marginTop:2}}>{customer.name}</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,color:"#94a3b8",cursor:"pointer"}}>✕</button>
        </div>
        <div style={{marginBottom:12}}>
          <label style={lbl}>Visit Notes</label>
          <textarea value={note} onChange={e=>setNote(e.target.value)} autoFocus rows={3}
            placeholder="Quick note — what was discussed, what they need, any wins..."
            style={{...inp,resize:"none",fontSize:14}}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
          <div>
            <label style={lbl}>Visit Date</label>
            <input type="date" value={visitDate} onChange={e=>setVisitDate(e.target.value)} style={inp}/>
          </div>
          <div>
            <label style={lbl}>Next Follow-Up</label>
            <input type="date" value={followUp} onChange={e=>setFollowUp(e.target.value)} style={inp}/>
          </div>
        </div>
        <button onClick={save} style={{...btn(NAPA_NAVY),width:"100%",padding:"13px 0",fontSize:15,borderRadius:10}}>
          ✅ Log Visit & Set Follow-Up
        </button>
      </div>
    </div>
  );
}

// ─── ACTIVE PROMOTIONS ───────────────────────────────────────────────────────
const RETAIL_PROMOS=[
  {cat:"🔧 Milwaukee M18 Power Tools",items:[
    "Buy 2 M18 batteries → Get a M18 battery FREE (BOGO)",
    "Buy M18 FUEL combo kit → Get FREE charger + tool bag",
    "M18 tool kits 20–35% off MSRP through Dec 31",
    "Show BURNCO / construction accounts: cordless impact & ratchet bundles",
  ]},
  {cat:"🛢️ Motor Oil — Valvoline & Mobil 1",items:[
    "Valvoline All grades (conventional, synthetic blend, full syn) — Nov/Dec special pricing",
    "5qt jugs AND 1qt singles both on deal — push bulk buys",
    "Mobil 1 Full Synthetic 5W-20 / 5W-30 / 0W-20 — special wholesale pricing",
    "Great pitch for quick lubes (Al's, Big Brand) stocking up before holiday rush",
  ]},
  {cat:"🌧️ Rain-X Wiper Blades",items:[
    "Save $12–$15 per pair vs list (38–42% off)",
    "Rain-X Latitude & Beam blade lines both on promo",
    "Best pitch: tire shops, quick lubes — high-ticket upsell at oil change",
  ]},
  {cat:"🔩 NAPA Platinum Oil Filters",items:[
    "Save $5 per filter vs regular NAPA pricing",
    "Push to ALL repair shops — highest margin filter in the lineup",
    "21348 (most popular fitment) — keep stocking accounts at par",
  ]},
  {cat:"🔋 Energizer Batteries",items:[
    "$5 customer rebate — EnergizerHoliday5.com — valid through Dec 31",
    "Max, Ultimate Lithium, and Recharge lines all rebate-eligible",
    "Great holiday gift pitch for counter customers",
  ]},
  {cat:"🔨 Carlyle Tools",items:[
    "20–40% off across the Carlyle hand tool lineup",
    "Best pitch: shops buying Christmas gifts for techs, or restocking toolbox staples",
    "Mechanics sets, ratchets, sockets — all on deal",
  ]},
  {cat:"🔋 Booster PAC / Truck PAC Jump Starters",items:[
    "25–29% off professional-grade jump starters",
    "Best pitch: fleet accounts, trucking (Frank Bartel, A-Z Bus), towing (All American)",
    "Truck PAC ES6000 and ES1224 — high-margin, great value for shops that boost daily",
  ]},
  {cat:"🚗 Chemical Guys Car Wash Kit",items:[
    "Kit priced at $49.99 — ready to go, makes an excellent shop gift",
    "Push to detailing shops and customer-facing repair shops",
  ]},
  {cat:"🏆 NAPA Rewards — YETI Cooler Giveaway",items:[
    "Customers enrolled in NAPA Rewards get entries to win YETI Tundra cooler",
    "Great reason to sign up ANY account that isn't enrolled yet",
    "AAA member discount available at counter — remind shops with AAA customers",
  ]},
];

function ActivePromotions({onClose}){
  const [tab,setTab]=useState("retail");
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:720,maxHeight:"93vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,0.3)"}}>
        <div style={{background:NAPA_NAVY,padding:"20px 24px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`3px solid ${NAPA_YELLOW}`,position:"sticky",top:0,zIndex:10}}>
          <div>
            <div style={{color:"#fff",fontWeight:800,fontSize:18}}>🏷️ Active Promotions</div>
            <div style={{color:"#94a3b8",fontSize:12,marginTop:2}}>Nov 1 – Dec 31, 2026 · North Texas Territory</div>
          </div>
          <button onClick={onClose} style={{color:"#94a3b8",background:"none",border:"none",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        {/* Sub-tabs */}
        <div style={{display:"flex",borderBottom:"1px solid #e2e8f0",background:"#fff",position:"sticky",top:69,zIndex:9}}>
          {[["retail","📋 Retail Sales Driver"],["realdeals","🏭 Real Deals Q4"]].map(([k,label])=>(
            <button key={k} onClick={()=>setTab(k)} style={{padding:"11px 20px",border:"none",background:"none",borderBottom:tab===k?`3px solid ${NAPA_YELLOW}`:"3px solid transparent",color:tab===k?NAPA_NAVY:"#64748b",fontWeight:700,fontSize:13,cursor:"pointer"}}>{label}</button>
          ))}
        </div>
        <div style={{padding:"20px 24px"}}>
          {tab==="retail"&&(
            <>
              <div style={{background:"#fff7ed",border:"1.5px solid #fed7aa",borderRadius:10,padding:"10px 16px",marginBottom:18,fontSize:13,color:"#92400e",fontWeight:600}}>
                💡 All deals run Nov 1 – Dec 31, 2026. Push these on every stop.
              </div>
              {RETAIL_PROMOS.map((sec,i)=>(
                <div key={i} style={{marginBottom:16,border:"1.5px solid #e2e8f0",borderRadius:10,overflow:"hidden"}}>
                  <div style={{background:NAPA_PANEL,padding:"10px 14px",fontWeight:800,fontSize:13,color:NAPA_NAVY,borderLeft:`4px solid ${NAPA_YELLOW}`}}>{sec.cat}</div>
                  <ul style={{margin:0,padding:"10px 14px 10px 30px",listStyle:"disc"}}>
                    {sec.items.map((item,j)=><li key={j} style={{fontSize:13,color:"#374151",lineHeight:1.6,marginBottom:4}}>{item}</li>)}
                  </ul>
                </div>
              ))}
            </>
          )}
          {tab==="realdeals"&&(
            <>
              <div style={{background:"#f0f9ff",border:"1.5px solid #bae6fd",borderRadius:10,padding:"16px",marginBottom:18}}>
                <div style={{fontWeight:800,fontSize:14,color:"#0c4a6e",marginBottom:6}}>🏭 Real Deals Q4 2026 — Shop Equipment Catalog</div>
                <div style={{fontSize:13,color:"#0369a1",lineHeight:1.6,marginBottom:12}}>
                  The Real Deals catalog features shop-based equipment sales: lifts, alignment equipment, air tools, shop supplies, and professional-grade equipment for your commercial accounts. Oct 1 – Dec 31, 2026.
                </div>
                <a href="https://realdeals.napaecatalog.com/Real-Deals-4Q-2026/1/" target="_blank" rel="noopener noreferrer"
                  style={{display:"inline-flex",alignItems:"center",gap:6,background:NAPA_NAVY,color:"#fff",padding:"10px 16px",borderRadius:8,fontWeight:700,fontSize:13,textDecoration:"none"}}>
                  📖 Open Real Deals Q4 Catalog →
                </a>
              </div>
              <div style={{background:"#fff7ed",border:"1.5px solid #fed7aa",borderRadius:10,padding:"12px 16px",marginBottom:16}}>
                <div style={{fontWeight:700,fontSize:13,color:"#92400e",marginBottom:6}}>💡 Best Accounts to Pitch Real Deals Equipment:</div>
                <ul style={{margin:0,padding:"0 0 0 20px",listStyle:"disc"}}>
                  {["BURNCO Ready-Mix — interested in Milwaukee tools, could want equipment","Fifth Gear Automotive — high-volume shop, always investing in equipment","Providence Automotive (Aubrey) — large shop, buys professional equipment","Big Brand Tire & Service locations — multi-bay shops, real equipment buyers","FCS Construction — fleet operation, shop equipment relevant","Any shop that mentioned needing a lift, alignment rack, or compressor in notes"].map((item,i)=>(
                    <li key={i} style={{fontSize:13,color:"#374151",lineHeight:1.6,marginBottom:4}}>{item}</li>
                  ))}
                </ul>
              </div>
              <div style={{background:"#f8fafc",border:"1.5px solid #e2e8f0",borderRadius:10,padding:"12px 16px"}}>
                <div style={{fontWeight:700,fontSize:12,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>To add full Real Deals content here</div>
                <div style={{fontSize:13,color:"#475569",lineHeight:1.6}}>Upload the Real Deals Q4 2026 PDF to this project folder (same as the Retail Sales Driver PDF) and I can read it and fill in all the details automatically.</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── NEGLECTED ACCOUNTS ALERT ────────────────────────────────────────────────
function NeglectedAlert({customers,onSelectCustomer,onDismiss}){
  const cutoff=new Date();cutoff.setDate(cutoff.getDate()-60);
  const cutoffStr=cutoff.toISOString().split("T")[0];
  const neglected=customers.filter(c=>{
    const lastActivity=c.lastVisit&&c.lastCall?(c.lastVisit>c.lastCall?c.lastVisit:c.lastCall):(c.lastVisit||c.lastCall||"");
    return(c.status==="Customer"||c.status==="Active")&&(!lastActivity||lastActivity<cutoffStr);
  }).sort((a,b)=>{
    const getL=c=>c.lastVisit&&c.lastCall?(c.lastVisit>c.lastCall?c.lastVisit:c.lastCall):(c.lastVisit||c.lastCall||"");
    return(getL(a)||"0").localeCompare(getL(b)||"0");
  });
  if(!neglected.length)return null;
  return(
    <div style={{margin:"0 24px 12px",background:"#fff7ed",border:"1.5px solid #f97316",borderRadius:12,overflow:"hidden"}}>
      <div style={{background:"#ea580c",padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{color:"#fff",fontWeight:800,fontSize:13}}>⚠️ {neglected.length} Customer{neglected.length!==1?"s":""} Not Contacted in 60+ Days</div>
        <button onClick={onDismiss} style={{background:"none",border:"none",color:"rgba(255,255,255,0.7)",cursor:"pointer",fontSize:16,fontWeight:700}}>✕</button>
      </div>
      <div style={{display:"flex",gap:0,overflowX:"auto",padding:"10px 12px"}}>
        {neglected.slice(0,8).map(c=>{
          const lastActivity=c.lastVisit&&c.lastCall?(c.lastVisit>c.lastCall?c.lastVisit:c.lastCall):(c.lastVisit||c.lastCall||"");
          const daysSince=lastActivity?Math.floor((new Date()-new Date(lastActivity+"T12:00:00"))/(1000*60*60*24)):null;
          return(
            <div key={c.id} onClick={()=>onSelectCustomer(c)} style={{flexShrink:0,marginRight:8,background:"#fff",border:"1.5px solid #fed7aa",borderRadius:8,padding:"8px 12px",cursor:"pointer",minWidth:140,maxWidth:160}} onMouseEnter={e=>e.currentTarget.style.borderColor="#f97316"} onMouseLeave={e=>e.currentTarget.style.borderColor="#fed7aa"}>
              <div style={{fontWeight:700,fontSize:12,color:"#1e293b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
              <div style={{fontSize:11,color:"#64748b"}}>{c.town}</div>
              <div style={{fontSize:11,fontWeight:700,color:"#ea580c",marginTop:3}}>{daysSince?`${daysSince}d ago`:"Never logged"}</div>
            </div>
          );
        })}
        {neglected.length>8&&<div style={{flexShrink:0,display:"flex",alignItems:"center",padding:"0 8px",fontSize:12,color:"#ea580c",fontWeight:700}}>+{neglected.length-8} more</div>}
      </div>
    </div>
  );
}

// ─── PRE-VISIT BRIEF ─────────────────────────────────────────────────────────
function PreVisitBrief({customer,onClose,onQuickLog}){
  const lastActivity=customer.lastVisit&&customer.lastCall?(customer.lastVisit>customer.lastCall?customer.lastVisit:customer.lastCall):(customer.lastVisit||customer.lastCall||"");
  const daysSince=lastActivity?Math.floor((new Date()-new Date(lastActivity+"T12:00:00"))/(1000*60*60*24)):null;
  const recentLogs=(customer.callLog||[]).slice().sort((a,b)=>b.date<a.date?-1:1).slice(0,3);
  const hasInventoryAlerts=(customer.inventory||[]).some(i=>i.currentStock<i.parLevel);
  const isOverdue=customer.nextFollowUp&&customer.nextFollowUp<today();

  // Smart pitch suggestions based on account type
  const pitches=[];
  if(["Auto Repair","Tire Shop","Quick Lube","Mechanic"].includes(customer.type)){pitches.push("🛢️ Valvoline / Mobil 1 oil deal — Nov/Dec pricing","🔩 NAPA Platinum Oil Filters — $5 off");}
  if(["Auto Repair","Performance","Restoration","Diesel Repair","Diesel Truck"].includes(customer.type)){pitches.push("🔧 Milwaukee M18 tools — BOGO battery deal");}
  if(["Tire Shop","Quick Lube","Auto Repair"].includes(customer.type)){pitches.push("🌧️ Rain-X wipers — 38-42% off, great upsell");}
  if(["Construction","Construction Fleet","Municipal Fleet","Trucking","Fleet / Bus","Towing"].includes(customer.type)){pitches.push("🔋 Booster PAC / Truck PAC — 25-29% off","🏭 Real Deals Q4 shop equipment catalog");}
  if(customer.isStocking&&hasInventoryAlerts){pitches.unshift("🔴 INVENTORY ALERT — check par levels before leaving");}
  if(customer.notes&&customer.notes.toLowerCase().includes("milwaukee")){pitches.unshift("🔧 Customer mentioned Milwaukee tools — push M18 BOGO deal");}
  if(!customer.acctNum){pitches.push("📋 No POS account # yet — open an account today");}

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:560,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,0.3)"}}>
        <div style={{background:NAPA_NAVY,padding:"18px 24px",borderRadius:"16px 16px 0 0",borderBottom:`3px solid ${NAPA_YELLOW}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{color:"#94a3b8",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em"}}>Pre-Visit Brief</div>
            <div style={{color:"#fff",fontWeight:800,fontSize:16}}>{customer.name}</div>
          </div>
          <button onClick={onClose} style={{color:"#94a3b8",background:"none",border:"none",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{padding:20}}>
          {/* Status bar */}
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
            <PriBadge p={customer.priority}/>{customer.status&&<StsBadge s={customer.status}/>}<SpendBadge spend={customer.monthlySpend}/>
            {customer.isStocking&&<span style={{background:NAPA_YELLOW+"33",color:NAPA_NAVY,border:`1px solid ${NAPA_YELLOW}`,padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700}}>📦 Stocking</span>}
          </div>

          {/* Contact */}
          <div style={{marginBottom:12,padding:"10px 14px",background:"#f8fafc",borderRadius:10,border:"1.5px solid #e2e8f0"}}>
            <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
              {customer.contact&&<div style={{fontSize:13,color:"#374151"}}><span style={{color:"#94a3b8",fontSize:11,fontWeight:700}}>CONTACT </span>{customer.contact}</div>}
              {customer.phone&&<a href={`tel:${customer.phone}`} style={{fontSize:13,color:"#16a34a",fontWeight:700,textDecoration:"none"}}>📞 {customer.phone}</a>}
              {customer.acctNum&&<div style={{fontSize:13,color:"#374151"}}><span style={{color:"#94a3b8",fontSize:11,fontWeight:700}}>ACCT </span>#{customer.acctNum}</div>}
              {customer.competitor&&<div style={{fontSize:13,color:"#dc2626",fontWeight:700}}>⚡ vs {customer.competitor}</div>}
            </div>
          </div>

          {/* Last contact */}
          <div style={{marginBottom:12,padding:"10px 14px",background:isOverdue?"#fff5f5":daysSince&&daysSince>30?"#fff7ed":"#f0fdf4",borderRadius:10,border:`1.5px solid ${isOverdue?"#fca5a5":daysSince&&daysSince>30?"#fed7aa":"#bbf7d0"}`}}>
            <div style={{fontWeight:700,fontSize:12,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>Last Contact</div>
            <div style={{fontSize:14,fontWeight:700,color:isOverdue?"#dc2626":daysSince&&daysSince>30?"#ea580c":"#16a34a"}}>
              {lastActivity?`${formatDate(lastActivity)} (${daysSince}d ago)`:"Never logged"}
            </div>
            {isOverdue&&<div style={{fontSize:12,color:"#dc2626",fontWeight:600,marginTop:3}}>⚠️ Follow-up was due {formatDate(customer.nextFollowUp)}</div>}
            {!isOverdue&&customer.nextFollowUp&&<div style={{fontSize:12,color:"#64748b",marginTop:3}}>📅 Next follow-up: {formatDate(customer.nextFollowUp)}</div>}
          </div>

          {/* Notes */}
          {customer.notes&&<div style={{marginBottom:12,padding:"10px 14px",background:"#f8fafc",borderRadius:10,border:"1.5px solid #e2e8f0"}}>
            <div style={{fontWeight:700,fontSize:12,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>Account Notes</div>
            <div style={{fontSize:13,color:"#374151",lineHeight:1.5}}>{customer.notes}</div>
          </div>}

          {/* What to pitch */}
          {pitches.length>0&&<div style={{marginBottom:12,padding:"10px 14px",background:"#fffbeb",borderRadius:10,border:"1.5px solid #fcd34d"}}>
            <div style={{fontWeight:700,fontSize:12,color:"#92400e",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>💡 Pitch Today</div>
            <ul style={{margin:0,padding:"0 0 0 18px",listStyle:"disc"}}>
              {pitches.map((p,i)=><li key={i} style={{fontSize:13,color:"#374151",lineHeight:1.6,marginBottom:3}}>{p}</li>)}
            </ul>
          </div>}

          {/* Recent activity */}
          {recentLogs.length>0&&<div style={{marginBottom:16,padding:"10px 14px",background:"#f8fafc",borderRadius:10,border:"1.5px solid #e2e8f0"}}>
            <div style={{fontWeight:700,fontSize:12,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Recent Activity</div>
            {recentLogs.map(log=>(
              <div key={log.id} style={{marginBottom:6,paddingBottom:6,borderBottom:"1px solid #f1f5f9"}}>
                <div style={{fontSize:11,color:"#94a3b8",fontWeight:600}}>{formatDate(log.date)}</div>
                <div style={{fontSize:13,color:"#374151"}}>{log.note}</div>
              </div>
            ))}
          </div>}

          {/* Actions */}
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{onClose();onQuickLog();}} style={{...btn(NAPA_NAVY),flex:1,padding:"11px 0",fontSize:14}}>⚡ Log This Visit</button>
            {customer.phone&&<a href={`tel:${customer.phone}`} style={{...btn("#16a34a"),textDecoration:"none",padding:"11px 16px",fontSize:14}}>📞 Call</a>}
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
  const [startFromStore,setStartFromStore]=useState(false);
  const pool=[...customers.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||c.town.toLowerCase().includes(search.toLowerCase()))].sort((a,b)=>distFromStore(a)-distFromStore(b));
  const toggle=c=>setStops(p=>p.find(s=>s.id===c.id)?p.filter(s=>s.id!==c.id):[...p,c]);
  const moveUp=i=>{if(i===0)return;const s=[...stops];[s[i-1],s[i]]=[s[i],s[i-1]];setStops(s);};
  const moveDown=i=>{if(i===stops.length-1)return;const s=[...stops];[s[i],s[i+1]]=[s[i+1],s[i]];setStops(s);};
  const saveRoute=()=>{if(!routeName.trim()||!stops.length)return;setSaved(r=>[...r,{name:routeName,stops:[...stops]}]);setRouteName("");};
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:840,maxHeight:"93vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,0.3)"}}>
        <div style={{background:NAPA_NAVY,padding:"20px 24px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`3px solid ${NAPA_YELLOW}`}}>
          <div><div style={{color:"#fff",fontWeight:800,fontSize:18}}>🗺️ Route Planner</div><div style={{color:"#64748b",fontSize:12,marginTop:2}}>Build your day — opens Google Maps with all stops loaded</div></div>
          <button onClick={onClose} style={{color:"#94a3b8",background:"none",border:"none",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{display:"flex",flexWrap:"wrap"}}>
          <div style={{padding:20,borderRight:"1.5px solid #e2e8f0",flex:"1 1 300px",minWidth:0}}>
            <div style={{fontWeight:700,fontSize:13,color:"#374151",marginBottom:8}}>Select Stops</div>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search..." style={{...inp,marginBottom:8}}/>
            <div style={{maxHeight:400,overflowY:"auto"}}>
              {pool.map(c=>{const isSel=stops.find(s=>s.id===c.id);return<div key={c.id} onClick={()=>toggle(c)} style={{padding:"9px 11px",borderRadius:8,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4,background:isSel?NAPA_YELLOW+"22":NAPA_PANEL,border:isSel?`1.5px solid ${NAPA_YELLOW}`:"1.5px solid transparent"}}>
                <div><div style={{fontWeight:700,fontSize:13,color:"#1e293b"}}>{typeIcons[c.type]||"🏪"} {c.name}</div><div style={{fontSize:11,color:"#64748b"}}>{c.town} · {c.lat?`${distFromStore(c).toFixed(1)}mi`:c.address}</div></div>
                <div style={{fontSize:17}}>{isSel?"✅":"⬜"}</div>
              </div>;})}</div>
          </div>
          <div style={{padding:20,flex:"1 1 300px",minWidth:0}}>
            <div style={{fontWeight:700,fontSize:13,color:"#374151",marginBottom:8}}>
              Your Route ({stops.length} stops)
              {stops.length>1&&<span style={{fontWeight:500,fontSize:12,color:"#64748b",marginLeft:8}}>~{stops.reduce((sum,c,i)=>sum+(i===0?(startFromStore?distMiles(NAPA_STORE.lat,NAPA_STORE.lng,c.lat||NAPA_STORE.lat,c.lng||NAPA_STORE.lng):0)+distFromStore(c):distMiles(stops[i-1].lat||NAPA_STORE.lat,stops[i-1].lng||NAPA_STORE.lng,c.lat||NAPA_STORE.lat,c.lng||NAPA_STORE.lng)),0).toFixed(0)} mi straight-line</span>}
            </div>
            {!stops.length&&<div style={{color:"#94a3b8",fontSize:13,textAlign:"center",padding:"36px 0"}}>Select customers on the left</div>}
            <div style={{maxHeight:260,overflowY:"auto",marginBottom:10}}>
              {stops.map((c,i)=>(
                <div key={c.id} style={{padding:"7px 10px",background:"#f8fafc",borderRadius:8,marginBottom:4,display:"flex",alignItems:"center",gap:8,border:"1.5px solid #e2e8f0"}}>
                  <span style={{fontWeight:800,fontSize:12,color:"#64748b",minWidth:18}}>{i+1}</span>
                  <div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,fontSize:12,color:"#1e293b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div><div style={{fontSize:11,color:"#64748b"}}>{c.town}{c.lat?` · ${distFromStore(c).toFixed(1)}mi`:""}</div></div>
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
                    {/* Start from store toggle */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",background:"#f0f9ff",borderRadius:8,border:"1.5px solid #bae6fd",marginBottom:10}}>
              <div style={{fontSize:12,fontWeight:700,color:"#0c4a6e"}}>🏪 Start from NAPA Store</div>
              <button onClick={()=>setStartFromStore(s=>!s)} style={{padding:"4px 12px",background:startFromStore?"#16a34a":"#d1d5db",color:startFromStore?"#fff":"#374151",border:"none",borderRadius:6,fontWeight:700,fontSize:12,cursor:"pointer"}}>{startFromStore?"ON":"OFF"}</button>
            </div>
            {startFromStore&&stops.length>0&&<div style={{fontSize:11,color:"#0369a1",marginBottom:8,padding:"6px 10px",background:"#e0f2fe",borderRadius:6}}>📍 Route starts: NAPA Auto Parts, 1333 US-377, Pilot Point TX → {stops.length} stop{stops.length!==1?"s":""}</div>}
            <a href={stops.length?multiStopMapsUrl(startFromStore?[{fullAddress:NAPA_STORE.address},...stops]:stops):"#"} target="_blank" rel="noopener noreferrer" style={{display:"block",textAlign:"center",padding:"13px 0",background:stops.length?"#16a34a":"#d1d5db",color:"#fff",borderRadius:10,fontWeight:800,fontSize:14,textDecoration:"none",opacity:stops.length?1:0.6,pointerEvents:stops.length?"auto":"none"}}>
              🗺️ Open Full Route in Google Maps
            </a>
            {stops.length>0&&<div style={{textAlign:"center",fontSize:11,color:"#64748b",marginTop:5}}>{startFromStore?"Starts at NAPA store → ":""}{stops.length} stop{stops.length!==1?"s":""} — turn-by-turn ready</div>}
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
  const [repF,setRepF]             = useState("");
  const [sortBy,setSortBy]         = useState("priority");
  const [viewMode,setViewMode]     = useState("grid");
  const [selected,setSelected]     = useState(null);
  const [showAdd,setShowAdd]       = useState(false);
  const [showRoute,setShowRoute]   = useState(false);
  const [showInv,setShowInv]       = useState(false);
  const [showPrint,setShowPrint]   = useState(false);
  const [showDash,setShowDash]     = useState(false);
  const [showCalls,setShowCalls]   = useState(false);
  const [showPromos,setShowPromos] = useState(false);
  const [showBrief,setShowBrief]   = useState(null);
  const [showQuickLog,setShowQuickLog] = useState(null);
  const [hideNeglected,setHideNeglected] = useState(false);
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
    if(repF)list=list.filter(c=>c.repName===repF);
    const ord={High:0,Medium:1,Low:2};
    if(sortBy==="priority")list=[...list].sort((a,b)=>(ord[a.priority]??3)-(ord[b.priority]??3));
    else if(sortBy==="spend")list=[...list].sort((a,b)=>(parseFloat(b.monthlySpend)||0)-(parseFloat(a.monthlySpend)||0));
    else if(sortBy==="rating")list=[...list].sort((a,b)=>(parseFloat(b.rating)||0)-(parseFloat(a.rating)||0));
    else if(sortBy==="followup")list=[...list].sort((a,b)=>(a.nextFollowUp||"9999")<(b.nextFollowUp||"9999")?-1:1);
    else if(sortBy==="distance")list=[...list].sort((a,b)=>distFromStore(a)-distFromStore(b));
    else if(sortBy==="name")list=[...list].sort((a,b)=>a.name.localeCompare(b.name));
    return list;
  },[customers,search,townF,priF,stsF,repF,sortBy,activeTab]);

  const stats=useMemo(()=>({
    total:customers.length,
    active:customers.filter(c=>c.status==="Customer"||c.status==="Active").length,
    followups:customers.filter(c=>c.nextFollowUp).length,
    stocking:customers.filter(c=>c.isStocking).length,
    reorders:customers.filter(c=>c.isStocking).flatMap(c=>(c.inventory||[]).filter(i=>i.currentStock<i.parLevel)).length,
    overdue:customers.filter(c=>c.nextFollowUp&&c.nextFollowUp<today()).length,
  }),[customers]);

  return(
    <div style={{fontFamily:"'Trebuchet MS','Segoe UI',sans-serif",background:NAPA_PANEL,minHeight:"100vh"}}>

      {/* ── HEADER ── */}
      <div style={{background:NAPA_NAVY,position:"sticky",top:0,zIndex:50,borderBottom:`4px solid ${NAPA_YELLOW}`}}>
        {/* Desktop header — single row */}
        <div style={{display:"none",maxWidth:1440,margin:"0 auto",padding:"0 24px",height:64,alignItems:"center",justifyContent:"space-between",gap:16}} className="desktop-header">
          <div style={{display:"flex",gap:24,alignItems:"center"}}>
            <NapaBrand/>
            <div style={{width:1,height:36,background:"rgba(255,255,255,0.15)"}}/>
            {[["🏢",stats.total,"Accounts"],["✅",stats.active,"Customers"],["📅",stats.overdue>0?`${stats.overdue} overdue`:stats.followups,"Follow-ups"],["🔴",stats.reorders,"Reorders"]].map(([icon,val,label])=>(
              <div key={label} style={{textAlign:"center"}}>
                <div style={{color:label==="Reorders"&&stats.reorders>0?"#ef4444":label==="Follow-ups"&&stats.overdue>0?"#fbbf24":"#fff",fontWeight:800,fontSize:17,lineHeight:1}}>{icon} {val}</div>
                <div style={{color:"#94a3b8",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginTop:3}}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:7,alignItems:"center"}}>
            <button onClick={()=>setShowDash(true)}   style={{...btn(NAPA_YELLOW,NAPA_NAVY),fontSize:12,padding:"8px 14px",fontWeight:800}}>📊 Dashboard</button>
            <button onClick={()=>setShowCalls(true)}  style={{...btn(stats.overdue>0?"#f59e0b":NAPA_YELLOW,NAPA_NAVY),fontSize:12,padding:"8px 14px",fontWeight:800}}>📋 Call List{stats.overdue>0?` (${stats.overdue})`:""}</button>
            <button onClick={()=>setShowPromos(true)} style={{...btn("#f97316"),fontSize:12,padding:"8px 14px",fontWeight:800}}>🏷️ Promos</button>
            <button onClick={()=>setShowRoute(true)}  style={{...btn(NAPA_YELLOW,NAPA_NAVY),fontSize:12,padding:"8px 14px",fontWeight:800}}>🗺️ Route</button>
            <button onClick={()=>setShowInv(true)}    style={{...btn(stats.reorders>0?NAPA_RED:NAPA_YELLOW,stats.reorders>0?"#fff":NAPA_NAVY),fontSize:12,padding:"8px 14px",fontWeight:800}}>📦 Inventory{stats.reorders>0?` (${stats.reorders})`:""}</button>
            <button onClick={()=>setShowAdd(true)}    style={{...btn(NAPA_RED),fontSize:12,padding:"8px 14px",fontWeight:800}}>➕ Add</button>
          </div>
        </div>
        {/* Mobile header — two rows */}
        <div style={{padding:"10px 14px 8px"}} className="mobile-header">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <NapaBrand/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            {[["🏢",stats.total,"Accounts"],["✅",stats.active,"Customers"],["📅",stats.overdue>0?stats.overdue:stats.followups,"Follow-ups"],["🔴",stats.reorders,"Reorders"]].map(([icon,val,label])=>(
              <div key={label} style={{textAlign:"center"}}>
                <div style={{color:label==="Reorders"&&stats.reorders>0?"#ef4444":label==="Follow-ups"&&stats.overdue>0?"#fbbf24":"#fff",fontWeight:800,fontSize:15,lineHeight:1}}>{icon} {val}</div>
                <div style={{color:"#94a3b8",fontSize:10,fontWeight:600,textTransform:"uppercase",marginTop:3}}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr 1fr",gap:4}}>
            <button onClick={()=>setShowDash(true)}   style={{...btn(NAPA_YELLOW,NAPA_NAVY),fontSize:10,padding:"7px 2px",textAlign:"center",fontWeight:800}}>📊<br/>Dash</button>
            <button onClick={()=>setShowCalls(true)}  style={{...btn(stats.overdue>0?"#f59e0b":NAPA_YELLOW,NAPA_NAVY),fontSize:10,padding:"7px 2px",textAlign:"center",fontWeight:800}}>📋<br/>Calls</button>
            <button onClick={()=>setShowPromos(true)} style={{...btn("#f97316"),fontSize:10,padding:"7px 2px",textAlign:"center",fontWeight:800}}>🏷️<br/>Promos</button>
            <button onClick={()=>setShowRoute(true)}  style={{...btn(NAPA_YELLOW,NAPA_NAVY),fontSize:10,padding:"7px 2px",textAlign:"center",fontWeight:800}}>🗺️<br/>Route</button>
            <button onClick={()=>setShowInv(true)}    style={{...btn(stats.reorders>0?NAPA_RED:NAPA_YELLOW,stats.reorders>0?"#fff":NAPA_NAVY),fontSize:10,padding:"7px 2px",textAlign:"center",fontWeight:800}}>📦<br/>Inv{stats.reorders>0?` ${stats.reorders}`:""}</button>
            <button onClick={()=>setShowAdd(true)}    style={{...btn(NAPA_RED),fontSize:10,padding:"7px 2px",textAlign:"center",fontWeight:800}}>➕<br/>Add</button>
          </div>
        </div>
      </div>
      <style>{`
        @media (min-width: 640px) {
          .desktop-header { display: flex !important; }
          .mobile-header { display: none !important; }
        }
      `}</style>

      {/* ── TABS ── */}
      <div style={{background:"#fff",borderBottom:"1px solid #e2e8f0",padding:"0 24px"}}>
        <div style={{maxWidth:1440,margin:"0 auto",display:"flex"}}>
          {[["all","📋 All Accounts"],["stocking",`📦 Stocking (${stats.stocking})`]].map(([tab,label])=>(
            <button key={tab} onClick={()=>setActiveTab(tab)} style={{padding:"12px 20px",border:"none",background:"none",borderBottom:activeTab===tab?`3px solid ${NAPA_YELLOW}`:"3px solid transparent",color:activeTab===tab?NAPA_NAVY:"#64748b",fontWeight:700,fontSize:13,cursor:"pointer",transition:"all 0.15s"}}>{label}</button>
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
          <select value={repF}   onChange={e=>setRepF(e.target.value)}   style={sel}><option value="">All Reps</option>{REPS.filter(Boolean).map(r=><option key={r}>{r}</option>)}</select>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={sel}>
            <option value="priority">Sort: Priority</option>
            <option value="spend">Sort: Spend $</option>
            <option value="rating">Sort: Rating</option>
            <option value="followup">Sort: Follow-up Date</option>
            <option value="distance">Sort: Distance from Store</option>
            <option value="name">Sort: Name A–Z</option>
          </select>
          <div style={{display:"flex",border:"1.5px solid #e2e8f0",borderRadius:8,overflow:"hidden"}}>
            {[["grid","⊞"],["list","☰"]].map(([v,icon])=>(
              <button key={v} onClick={()=>setViewMode(v)} style={{padding:"7px 13px",border:"none",background:viewMode===v?NAPA_NAVY:"#fff",color:viewMode===v?"#fff":"#64748b",cursor:"pointer",fontSize:15}}>{icon}</button>
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

      {/* ── NEGLECTED ACCOUNTS ALERT ── */}
      {!hideNeglected&&<NeglectedAlert customers={customers} onSelectCustomer={c=>setSelected(c)} onDismiss={()=>setHideNeglected(true)}/>}

      {/* ── CONTENT ── */}
      <div style={{maxWidth:1440,margin:"0 auto",padding:"16px 24px"}}>
        {viewMode==="grid"?(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(298px,1fr))",gap:13}}>
            {filtered.map(c=>{
              const t=getSpendTier(c.monthlySpend);
              const days=daysUntil(c.nextFollowUp);
              const isOverdue=days!==null&&days<0;
              return<div key={c.id} onClick={()=>setSelected(c)} style={{background:"#fff",borderRadius:12,padding:16,cursor:"pointer",border:"1.5px solid #dde5f4",borderLeft:`4px solid ${t.dot}`,boxShadow:"0 1px 4px rgba(8,29,99,0.07)",transition:"all 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 6px 16px rgba(0,0,0,0.1)";e.currentTarget.style.transform="translateY(-1px)";}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.05)";e.currentTarget.style.transform="none";}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div style={{fontSize:22}}>{typeIcons[c.type]||"🏪"}</div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"flex-end"}}>
                    <PriBadge p={c.priority}/>{c.status&&<StsBadge s={c.status}/>}
                    {c.isStocking&&<span style={{background:NAPA_YELLOW+"33",color:NAPA_NAVY,border:`1px solid ${NAPA_YELLOW}`,padding:"2px 6px",borderRadius:20,fontSize:10,fontWeight:700}}>📦</span>}
                  </div>
                </div>
                <div style={{fontWeight:800,fontSize:14,color:"#1e293b",marginBottom:2,lineHeight:1.3}}>{c.name}</div>
                <div style={{fontSize:11,color:"#64748b",fontWeight:600,marginBottom:5}}>{c.town} · {c.type}{c.acctNum?` · #${c.acctNum}`:""}{c.lat?<span style={{marginLeft:6,color:"#94a3b8",fontWeight:500}}>📍 {distFromStore(c).toFixed(1)}mi</span>:null}</div>
                <AddrLink addr={c.fullAddress||c.address} style={{fontSize:12,marginBottom:5,display:"block"}}/>
                {c.contact&&<div style={{fontSize:12,color:"#475569",marginBottom:4}}>👤 {c.contact}</div>}
                {c.phone&&<a href={`tel:${c.phone}`} onClick={e=>e.stopPropagation()} style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:12,color:"#16a34a",fontWeight:700,textDecoration:"none",marginBottom:4,background:"#f0fdf4",padding:"3px 8px",borderRadius:20,border:"1px solid #bbf7d0"}}>📞 {c.phone}</a>}
                {c.competitor&&<div style={{fontSize:11,color:"#dc2626",fontWeight:600,marginBottom:3}}>⚡ vs {c.competitor}</div>}
                {c.notes&&<div style={{fontSize:12,color:"#64748b",marginBottom:8,lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{c.notes}</div>}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:8,borderTop:"1px solid #f1f5f9"}}>
                  <SpendBadge spend={c.monthlySpend}/>
                  {c.rating?<span style={{fontSize:12,color:"#f59e0b",fontWeight:700}}>★ {c.rating}</span>:<span style={{fontSize:12,color:"#d1d5db"}}>No rating</span>}
                </div>
                {c.nextFollowUp&&<div style={{marginTop:7,padding:"4px 8px",background:isOverdue?"#fee2e2":"#fef3c7",borderRadius:6,fontSize:11,color:isOverdue?"#991b1b":"#92400e",fontWeight:600}}>{isOverdue?`⚠️ Overdue: ${formatDate(c.nextFollowUp)}`:`📅 Follow-up: ${formatDate(c.nextFollowUp)}`}</div>}
                {c.isStocking&&(c.inventory||[]).some(i=>i.currentStock<i.parLevel)&&<div style={{marginTop:5,padding:"4px 8px",background:"#fee2e2",borderRadius:6,fontSize:11,color:"#991b1b",fontWeight:700}}>🔴 Inventory reorder needed</div>}
                {/* Quick actions */}
                <div style={{marginTop:8,display:"flex",gap:5}} onClick={e=>e.stopPropagation()}>
                  <button onClick={e=>{e.stopPropagation();setShowBrief(c);}} style={{flex:1,padding:"5px 0",background:"#f0f9ff",border:"1.5px solid #bae6fd",borderRadius:7,fontSize:11,fontWeight:700,color:"#0369a1",cursor:"pointer"}}>📋 Brief</button>
                  <button onClick={e=>{e.stopPropagation();setShowQuickLog(c);}} style={{flex:1,padding:"5px 0",background:"#f0fdf4",border:"1.5px solid #bbf7d0",borderRadius:7,fontSize:11,fontWeight:700,color:"#16a34a",cursor:"pointer"}}>⚡ Log Visit</button>
                </div>
              </div>;
            })}
          </div>
        ):(
          <div style={{background:"#fff",borderRadius:12,border:"1.5px solid #e2e8f0",overflow:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:960}}>
              <thead>
                <tr style={{background:NAPA_NAVY,borderBottom:`2px solid ${NAPA_YELLOW}`}}>
                  {["Business","Town","Type","Acct #","Distance","Phone","Contact","Rep","Spend","Priority","Status","Follow-Up"].map(h=>(
                    <th key={h} style={{padding:"9px 11px",fontSize:11,fontWeight:700,color:"#cbd5e1",textAlign:"left",textTransform:"uppercase",letterSpacing:"0.05em",whiteSpace:"nowrap"}}>{h}</th>
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
                    <td style={{padding:"8px 11px",fontSize:12,color:"#94a3b8"}}>{c.lat?`${distFromStore(c).toFixed(1)} mi`:"—"}</td>
                    <td style={{padding:"8px 11px",whiteSpace:"nowrap"}}>{c.phone?<a href={`tel:${c.phone}`} onClick={e=>e.stopPropagation()} style={{color:"#16a34a",fontSize:12,fontWeight:700,textDecoration:"none"}}>📞 {c.phone}</a>:<span style={{color:"#d1d5db",fontSize:12}}>—</span>}</td>
                    <td style={{padding:"8px 11px",fontSize:12,color:"#64748b"}}>{c.contact||"—"}</td>
                    <td style={{padding:"8px 11px",fontSize:12,color:"#64748b"}}>{c.repName||"—"}</td>
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
      {showPromos &&<ActivePromotions onClose={()=>setShowPromos(false)}/>}
      {showBrief  &&<PreVisitBrief customer={showBrief} onClose={()=>setShowBrief(null)} onQuickLog={()=>{setShowQuickLog(showBrief);setShowBrief(null);}}/>}
      {showQuickLog&&<QuickVisitLog customer={showQuickLog} onSave={c=>{updC(c);}} onClose={()=>setShowQuickLog(null)}/>}
    </div>
  );
}
