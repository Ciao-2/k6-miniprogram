import { Rate } from 'k6/metrics';
import { promotions } from '../promotions.js';
import { postQuery } from '../utils.js';

const failureRate = new Rate('check_failure_rate');

const config = {
    // host:  'https://api.scmally.startcatcher.cn/shop-api',
    host:'http://127.0.0.1:3000/shop-api',
    headers: {
        'Content-Type': 'application/json',
        'vendure-token': 'snrq0k7ry49cni771gzr',
    },
};

export const options = {
  stages: [
    // Linearly ramp up from 1 to 50 VUs during first minute
    {target: 100, duration: '5s'},
    // Hold at 50 VUs for the next 3 minutes and 30 seconds
    {target: 100, duration: '60s'},
    // Linearly ramp down from 50 to 0 50 VUs over the last 30 seconds
    // { target: 0, duration: "30s" }
    // Total execution time will be ~5 minutes
  ],
  thresholds: {
    // We want the 95th percentile of all HTTP request durations to be less than 500ms
    http_req_duration: ['p(95)<500'],
    // Requests with the staticAsset tag should finish even faster
    'http_req_duration{staticAsset:yes}': ['p(99)<250'],
    // Thresholds based on the custom metric we defined and use to track application failures
    check_failure_rate: [
      // Global failure rate should be less than 1%
      'rate<0.01',
      // Abort the test early if it climbs over 5%
      {threshold: 'rate<=0.05', abortOnFail: true},
    ],
  },
};


function productActivitiesFindOne() {
  const promotionId =  String(promotions[Math.floor(Math.random() * promotions.length)].id);
  const query = `
    query productActivitiesFindOne($id: ID!) {\n  productActivitiesFindOne(id: $id) {\n    ... on Coupon {\n      ...Coupon\n    }\n    ... on PurchasePremium {\n      ...PurchasePremium\n    }\n    ... on DiscountActivity {\n      ...DiscountActivity\n    }\n    ... on FullDiscountPresent {\n      ...FullDiscountPresent\n    }\n    ... on PackageDiscount {\n      ...PackageDiscount\n    }\n    ... on SelectiveGiftActivity {\n      ...SelectiveGiftActivity\n    }\n  }\n}\n\nfragment Coupon on Coupon {\n  __typename\n  id\n  createdAt\n  state\n  enable\n  updatedAt\n  name\n  remarks\n  type\n  preferentialContent {\n    preferentialType\n    minimum\n    discount\n    maximumOffer\n    includingDiscountProducts\n  }\n  validityPeriod {\n    type\n    startTime\n    endTime\n    numberOfDays\n  }\n  totalQuantity\n  applicableProduct {\n    applicableType\n    productIds\n  }\n  claimRestriction\n  whetherRestrictUsers\n  memberPlanIds\n  introduce\n  promotion {\n    id\n  }\n  activityContent\n  activityTime\n}\n\nfragment PurchasePremium on PurchasePremium {\n  __typename\n  id\n  createdAt\n  updatedAt\n  name\n  remarks\n  validityPeriod {\n    type\n    startTime\n    endTime\n    numberOfDays\n  }\n  state\n  minimum\n  applicableProduct {\n    applicableType\n    productIds\n  }\n  purchasePremiumProducts {\n    id\n    createdAt\n    updatedAt\n    price\n    enabled\n    product {\n      id\n      name\n      slug\n      description\n      enabled\n      optionGroups {\n        id\n        code\n        name\n        customFields {\n          priority\n        }\n        options {\n          id\n          code\n          name\n          customFields {\n            priority\n          }\n        }\n      }\n      variants {\n        id\n        name\n        options {\n          code\n          name\n          id\n          group {\n            id\n            code\n            name\n          }\n        }\n        featuredAsset {\n          id\n          preview\n          source\n        }\n        isThereAnyStock\n        price\n        priceWithTax\n        sku\n      }\n      featuredAsset {\n        id\n        width\n        height\n        name\n        preview\n        source\n        type\n      }\n      customFields {\n        price\n        markingPrice\n        unit\n        particulars\n        limitType\n        limitCount\n        putOnSaleType\n        putOnSaleTime\n      }\n    }\n  }\n  activitySynopsis\n  stackingDiscountSwitch\n  stackingPromotionTypes\n  introduce\n  activityContent\n  activitySuperposition\n  promotion {\n    id\n  }\n}\n\nfragment DiscountActivity on DiscountActivity {\n  __typename\n  id\n  name\n  createdAt\n  updatedAt\n  remarks\n  status\n  startTime\n  endTime\n  minimum\n  introduce\n  discount\n  productIds\n  stackingDiscountSwitch\n  stackingPromotionTypes\n  smallProgramQRCodeLink\n  activityContent\n  activitySynopsis\n  activitySuperposition\n  promotion {\n    id\n  }\n}\n\nfragment FullDiscountPresent on FullDiscountPresent {\n  __typename\n  id\n  name\n  createdAt\n  updatedAt\n  remarks\n  status\n  startTime\n  endTime\n  fullDiscountType: type\n  introduce\n  ruleType\n  fullDiscountType: type\n  ruleValues {\n    minimum\n    discountValue {\n      discountType\n      discount\n    }\n    freeGiftValues {\n      freeGiftId\n      maximumOffer\n    }\n    maximumOffer\n  }\n  applicableProduct {\n    applicableType\n    productIds\n  }\n  stackingDiscountSwitch\n  stackingPromotionTypes\n  whetherRestrictUsers\n  memberPlanIds\n  fullDiscountContent: activityContent {\n    fullMinus\n    fullDiscount\n    fullPresent\n  }\n  fullDiscountActivitySynopsis: activitySynopsis {\n    synopsisStr\n    synopsisTags\n  }\n  activitySuperposition\n  promotion {\n    id\n  }\n  activityGifts {\n    id\n    name\n    slug\n    description\n    enabled\n    variants {\n      id\n      name\n      options {\n        code\n        name\n        id\n        group {\n          id\n          code\n          name\n        }\n      }\n      featuredAsset {\n        id\n        preview\n        source\n      }\n      isThereAnyStock\n      price\n      priceWithTax\n      sku\n    }\n    featuredAsset {\n      id\n      width\n      height\n      name\n      preview\n      source\n      type\n    }\n    customFields {\n      price\n      markingPrice\n      unit\n      particulars\n      limitType\n      limitCount\n      putOnSaleType\n      putOnSaleTime\n      isVipProduct\n    }\n  }\n}\n\nfragment PackageDiscount on PackageDiscount {\n  __typename\n  id\n  createdAt\n  updatedAt\n  name\n  displayName\n  remarks\n  status\n  startTime\n  endTime\n  price\n  selectCount\n  productIds\n  stackingDiscountSwitch\n  stackingPromotionTypes\n  activitySynopsis\n  activityContentType: activityContent\n  promotion {\n    id\n  }\n  activitySuperposition\n  statisticsData {\n    totalPayment\n    totalOrders\n    customerCount\n    averageOrderValue\n  }\n}\n\nfragment SelectiveGiftActivity on SelectiveGiftActivity {\n  __typename\n  id\n  createdAt\n  updatedAt\n  displayName\n  name\n  selectiveGiftActivityType: type\n  remarks\n  status\n  startTime\n  endTime\n  introduce\n  ruleType\n  ruleValues {\n    minimum\n    discountValue {\n      discountType\n      discount\n    }\n    freeGiftValues {\n      freeGiftId\n      maximumOffer\n    }\n    maximumOffer\n  }\n  applicableProduct {\n    applicableType\n    productIds\n  }\n  stackingDiscountSwitch\n  stackingPromotionTypes\n  whetherRestrictUsers\n  memberPlanIds\n  promotion {\n    id\n  }\n  activityContent\n  activitySynopsis\n  activitySuperposition\n  activityGifts {\n    id\n    name\n    slug\n    description\n    enabled\n    variants {\n      id\n      name\n      options {\n        code\n        name\n        id\n        group {\n          id\n          code\n          name\n        }\n      }\n      featuredAsset {\n        id\n        preview\n        source\n      }\n      isThereAnyStock\n      price\n      priceWithTax\n      sku\n    }\n    featuredAsset {\n      id\n      width\n      height\n      name\n      preview\n      source\n      type\n    }\n    customFields {\n      price\n      markingPrice\n      unit\n      particulars\n      limitType\n      limitCount\n      putOnSaleType\n      putOnSaleTime\n      isVipProduct\n    }\n  }\n}
  `;
  const res = postQuery('productActivitiesFindOne', query, { id: promotionId }, { failureRate });
  const productActivitiesFindOneId = res.productActivitiesFindOne&&res.productActivitiesFindOne.id;
  const typename = res.productActivitiesFindOne && res.productActivitiesFindOne.__typename;
  if (productActivitiesFindOneId && typename) {
    areAllEligibleProductsInactiveOrSoldOut(productActivitiesFindOneId, typename);
    const applicableProduct = res.productActivitiesFindOne&&res.productActivitiesFindOne.applicableProduct;
    const productIds = applicableProduct.productIds;
    if (productIds && productIds.length) {
      products(productIds);
    }
  }
}

function areAllEligibleProductsInactiveOrSoldOut(id, typename) {
  const type = getPromotionType(typename);
  const query = `
    query areAllEligibleProductsInactiveOrSoldOut($promotionId: ID!, $promotionType: PromotionType!) {\n  areAllEligibleProductsInactiveOrSoldOut(\n    promotionId: $promotionId\n    promotionType: $promotionType\n  )\n}
  `;
  postQuery('areAllEligibleProductsInactiveOrSoldOut', query, { promotionId:id, promotionType: type },{failureRate});
}
 
function getPromotionType(typename) {
  switch (typename) {
    case "Member":
      return 'member';
    case "PurchaseAtAPremium":
      return 'purchaseAtAPremium';
    case "Coupon":
      return 'coupon';
    case "DiscountActivity":
      return 'discountActivity';
    case "FullDiscountPresent":
      return 'fullDiscountPresent';
    case "AutomaticPromotion":
      return 'automaticPromotion';
    case "PackageDiscount":
      return 'packageDiscount';
    case "ActuallyPaid":
      return 'actuallyPaid';
    case "MemberPrice":
      return 'memberPrice';
    case "SelectiveGift":
      return 'selectiveGift';
    case "PaymentReward":
      return 'paymentReward';
    default:
      return 'coupon';
  }
}

function products(ids) {
  const query = `
       query products($options: ProductListOptions) {
    products(options: $options) {
      items {
        id
        name
        slug
        description
        enabled
        productPurchasePermission {
          id
          productId
          isMembershipPlanPurchase
          membershipPlans {
            id
          }
          guideMembershipPlanId
        }
        memberPriceActivityAmount {
          minDiscount
          maxDiscount
          minMemberPriceAmount
          maxMemberPriceAmount
          memberPriceProductVariant {
            memberPriceAmount
            productVariantId
            memberDiscount
            discountType
          }
        }
        optionGroups {
          id
          code
          name
          customFields {
            priority
          }
          options {
            id
            code
            name
            customFields {
              priority
            }
          }
        }
        variants {
          id
          name
          options {
            code
            name
            id
            group {
              id
              code
              name
            }
          }
          featuredAsset {
            id
            preview
            source
          }
          isThereAnyStock
          price
          priceWithTax
          sku
        }
        featuredAsset {
          id
          width
          height
          name
          preview
          source
          type
        }
        customFields {
          price
          markingPrice
          unit
          particulars
          limitType
          limitCount
          putOnSaleType
          putOnSaleTime
          isVipProduct
        }
        participatingActivities {
          id
          createdAt
          updatedAt
          startsAt
          endsAt
          couponCode
          perCustomerUsageLimit
          enabled
          customFields {
            type
            activityName
          }
        }
      }
      totalItems
    }
  }
    `;
  postQuery('products', query, {
      options: {
        skip: 0,
        take: 10,
        filter: {
          name: {
            contains: ''
          },
          freeGift: {
            eq: false
          },
          id: {
            in: ids
          }
        },
        sort: {
          createdAt: 'DESC'
        }
      }
    },{failureRate});
}

function getShoppingCart() {
  const query = `
    query getShoppingCart($isRemoveMarkUp: Boolean, $isUseMember: Boolean) {\n  getShoppingCart(isRemoveMarkUp: $isRemoveMarkUp, isUseMember: $isUseMember) {\n    shoppingTrolley {\n      ...Order\n    }\n    outrightPurchase {\n      ...Order\n    }\n  }\n}\n\nfragment Order on Order {\n  id\n  createdAt\n  updatedAt\n  orderPlacedAt\n  code\n  state\n  total\n  subTotal\n  subTotalPrice\n  totalPrice\n  totalQuantity\n  customFields {\n    isAvailableAfterSale\n    timeoutPeriodToBePaid\n    timeoutPeriodToBeReceived\n    remark\n    orderPromotionResult {\n      promResult {\n        orderTotalPrice\n      }\n    }\n  }\n  fulfillments {\n    id\n    createdAt\n    method\n  }\n  lines {\n    ...OrderLine\n  }\n  surcharges {\n    id\n    price\n  }\n  shipping\n  shippingAddress {\n    fullName\n    company\n    streetLine1\n    streetLine2\n    city\n    province\n    postalCode\n    country\n    countryCode\n    phoneNumber\n    customFields {\n      district\n    }\n  }\n}\n\nfragment OrderLine on OrderLine {\n  id\n  quantity\n  totalQuantity\n  unitPrice\n  featuredAsset {\n    preview\n  }\n  merchantVoluntaryRefund\n  productVariant {\n    ...ProductVariant\n  }\n  customFields {\n    purchasePattern\n    isAvailableAfterSale\n    afterSaleLine {\n      id\n      createdAt\n      updatedAt\n      quantity\n      price\n    }\n    afterSale {\n      id\n      cause\n      state\n      mode\n    }\n  }\n}\n\nfragment ProductVariant on ProductVariant {\n  id\n  sku\n  price\n  name\n  options {\n    code\n    name\n  }\n  featuredAsset {\n    id\n    preview\n    source\n  }\n  isThereAnyStock\n  product {\n    ...Product\n  }\n}\n\nfragment Product on Product {\n  id\n  name\n  updatedAt\n  slug\n  description\n  enabled\n  customFields {\n    isVipProduct\n    unit\n    particulars\n    putOnSaleType\n    putOnSaleTime\n  }\n  productPurchasePermission {\n    id\n    productId\n    isMembershipPlanPurchase\n    membershipPlans {\n      id\n    }\n    guideMembershipPlanId\n  }\n  memberPriceActivityAmount {\n    minDiscount\n    maxDiscount\n    minMemberPriceAmount\n    maxMemberPriceAmount\n    memberPriceProductVariant {\n      memberPriceAmount\n      productVariantId\n      memberDiscount\n      discountType\n    }\n  }\n  optionGroups {\n    id\n    code\n    name\n    customFields {\n      priority\n    }\n    options {\n      id\n      code\n      name\n      customFields {\n        priority\n      }\n    }\n  }\n  variants {\n    id\n    name\n    options {\n      id\n      code\n      name\n      group {\n        id\n        code\n        name\n      }\n    }\n    featuredAsset {\n      id\n      preview\n      source\n    }\n    isThereAnyStock\n    price\n    sku\n  }\n  featuredAsset {\n    id\n    width\n    height\n    name\n    preview\n    source\n    type\n  }\n  customFields {\n    price\n    markingPrice\n    unit\n    particulars\n    limitType\n    limitCount\n  }\n  participatingActivities {\n    id\n    createdAt\n    updatedAt\n    startsAt\n    endsAt\n    couponCode\n    perCustomerUsageLimit\n    enabled\n    customFields {\n      type\n      activityName\n    }\n  }\n}
  `;
  const res = postQuery('getShoppingCart', query, { isRemoveMarkUp: true, isUseMember: true }, { failureRate });
  const ids = [];
  const shoppingTrolley = res.getShoppingCart&&res.getShoppingCart.shoppingTrolley;
  if (shoppingTrolley&&shoppingTrolley.id) {
    ids.push(shoppingTrolley.id);
  }
  const outrightPurchase = res.getShoppingCart&&res.getShoppingCart.outrightPurchase;
  if (outrightPurchase&&shoppingTrolley.id) { 
    ids.push(outrightPurchase.id);
  }
  if (ids && ids.length) { 
    orderPromotionResult(ids);
  }
}

function orderPromotionResult(ids) {
  const query = `
  query orderPromotionResult($orderIds: [ID!]!) {\n  orderPromotionResult(orderIds: $orderIds) {\n    id\n    createdAt\n    updatedAt\n    promResult {\n      orderId\n      discountAmount\n      promLineResults {\n        promInstanceId\n        tags\n        orderLines {\n          orderLineId\n          discountCount\n          discountAmount\n          skuId\n          discount\n          displayInThisGroup\n        }\n        priority\n        type\n        shouldGroup\n        description\n        promTime\n        promContent\n        promOverview\n        discountType\n        discountAmount\n        discountCount\n        meetCondition\n        superimposeType\n        superimposeTypes\n        gifts {\n          promInstanceId\n          giftType\n          items {\n            giftId\n            productId\n            skuId\n            count\n            name\n            giftPrice\n            price\n            selected\n          }\n        }\n        coupons {\n          couponId\n          selected\n          price\n          autoSelected\n        }\n      }\n      orderLinePromResults {\n        orderLineId\n        skuId\n        count\n        price\n        discountAmount\n        discountDetails {\n          promInstanceId\n          type\n          superimposeType\n          superimposeTypes\n          discountCount\n          discountAmount\n        }\n      }\n      leftOrderLines {\n        skuId\n        lineId\n        count\n        price\n        discountAmount\n      }\n      discountByTypes {\n        type\n        discountAmount\n      }\n      gifts {\n        promInstanceId\n        giftType\n        items {\n          giftId\n          productId\n          skuId\n          count\n          name\n          giftPrice\n          price\n          selected\n        }\n      }\n      coupons {\n        couponId\n        selected\n        price\n      }\n      disableMember\n    }\n  }\n}
  `;
  postQuery('orderPromotionResult', query, { orderIds: ids },{failureRate});
}
 

export default function () {
  productActivitiesFindOne();
  getShoppingCart();
}