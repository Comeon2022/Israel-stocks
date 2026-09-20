export type ExpandedIssuer={canonicalId:string;displayName:string;business:string;sectorGroup:string;existingClass:string|null;fv2Compatibility:'FV2_COMPATIBLE'|'FV2_PROFILE_MISSING'|'FV2_NOT_YET_APPROPRIATE';status:'NEEDS_REVIEW'}
export const EXPANDED_ISSUERS:ExpandedIssuer[]=[
 {canonicalId:'strauss',displayName:'Strauss Group',business:'Branded food, beverages and consumer staples',sectorGroup:'Branded Consumer',existingClass:'CONSUMER_DEFENSIVE_BRANDED',fv2Compatibility:'FV2_COMPATIBLE',status:'NEEDS_REVIEW'},
 {canonicalId:'fox',displayName:'Fox-Wizel',business:'Apparel and lifestyle retail',sectorGroup:'Apparel Retail',existingClass:null,fv2Compatibility:'FV2_PROFILE_MISSING',status:'NEEDS_REVIEW'},
 {canonicalId:'max-stock',displayName:'Max Stock',business:'Discount and general merchandise retail',sectorGroup:'General Merchandise Retail',existingClass:null,fv2Compatibility:'FV2_PROFILE_MISSING',status:'NEEDS_REVIEW'},
 {canonicalId:'delta-israel-brands',displayName:'Delta Israel Brands',business:'Apparel, underwear and branded retail',sectorGroup:'Apparel Retail',existingClass:null,fv2Compatibility:'FV2_PROFILE_MISSING',status:'NEEDS_REVIEW'},
 {canonicalId:'castro',displayName:'Castro Model',business:'Fashion and apparel retail',sectorGroup:'Apparel Retail',existingClass:null,fv2Compatibility:'FV2_PROFILE_MISSING',status:'NEEDS_REVIEW'},
 {canonicalId:'diplomat',displayName:'Diplomat Holdings',business:'Import, marketing and distribution of consumer products',sectorGroup:'Consumer Distribution',existingClass:'FOOD_DISTRIBUTION',fv2Compatibility:'FV2_NOT_YET_APPROPRIATE',status:'NEEDS_REVIEW'},
 {canonicalId:'victory',displayName:'Victory Supermarket Chain',business:'Food retail and supermarkets',sectorGroup:'Food Retail',existingClass:'FOOD_RETAIL',fv2Compatibility:'FV2_COMPATIBLE',status:'NEEDS_REVIEW'},
 {canonicalId:'tiv-taam',displayName:'Tiv Taam Holdings',business:'Food retail and supermarkets',sectorGroup:'Food Retail',existingClass:'FOOD_RETAIL',fv2Compatibility:'FV2_COMPATIBLE',status:'NEEDS_REVIEW'},
 {canonicalId:'isrotel',displayName:'Isrotel',business:'Hotel chain and tourism',sectorGroup:'Hotels',existingClass:null,fv2Compatibility:'FV2_NOT_YET_APPROPRIATE',status:'NEEDS_REVIEW'},
 {canonicalId:'dan-hotels',displayName:'Dan Hotels',business:'Hotels and tourism',sectorGroup:'Hotels',existingClass:null,fv2Compatibility:'FV2_NOT_YET_APPROPRIATE',status:'NEEDS_REVIEW'},
]
export const expandedCanonicalIds=()=>EXPANDED_ISSUERS.map(x=>x.canonicalId)
