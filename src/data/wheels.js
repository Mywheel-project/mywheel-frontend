// BBS 휠
import bbsChRImg from '../assets/wheels/BBS_CH-R.png';
import bbsCiRImg from '../assets/wheels/BBS_CI-R.png';
import bbsFiRImg from '../assets/wheels/BBS_FI-R.jpg';
import bbsFsImg from '../assets/wheels/BBS_FS.jpg';
import bbsLmImg from '../assets/wheels/BBS_LM.jpg';
import bbsRgRImg from '../assets/wheels/BBS_RG-R.jpg';
import bbsSuperRsImg from '../assets/wheels/BBS_SUPER-RS.jpg';
import bbsXrImg from '../assets/wheels/BBS_XR.jpg';

// RAYS 휠
import rays2x9RImg from '../assets/wheels/RAYS_2x9R.webp';
import rays2x10MDImg from '../assets/wheels/RAYS_2x10MD.webp';
import raysG025LtdImg from '../assets/wheels/RAYS_G025_LTD.webp';
import raysTe37Gravel3Img from '../assets/wheels/RAYS_TE37_GRAVEL_III.webp';
import raysTe37SagaSlMspecImg from '../assets/wheels/RAYS_TE37_SAGA_SL_Mspec.webp';
import raysVougeSeImg from '../assets/wheels/RAYS_VOUGE_SE.webp';
import raysVv27SImg from '../assets/wheels/RAYS_VV27S.webp';
import raysZe40Img from '../assets/wheels/RAYS_ZE40.webp';

// WORK 휠
import workBrunnenImg from '../assets/wheels/WORK_BRUNNEN.webp';
import workCrShigokuImg from '../assets/wheels/WORK_CR_Shigoku.webp';
import workCvxImg from '../assets/wheels/WORK_CVX.webp';
import workRs11Img from '../assets/wheels/WORK_RS11.webp';
import workRxmImg from '../assets/wheels/WORK_RXM.webp';
import workRxsImg from '../assets/wheels/WORK_RXS.webp';
import workStrahlImg from '../assets/wheels/WORK_STRAHL.webp';
import workZr7Img from '../assets/wheels/WORK_ZR7.webp';

// ENKEI 휠
import enkeiGtc02Img from '../assets/wheels/ENKEI_gtc02.jpg';
import enkeiNvr5Img from '../assets/wheels/ENKEI_NVR5.jpg';
import enkeiPhantomImg from '../assets/wheels/ENKEI_PHANTOM.jpg';
import enkeiQuestImg from '../assets/wheels/ENKEI_Quest.jpg';
import enkeiRpf1RsImg from '../assets/wheels/ENKEI_RPF1RS.jpg';
import enkeiTm7Img from '../assets/wheels/ENKEI_TM7.webp';
import enkeiTmsImg from '../assets/wheels/ENKEI_TMS.jpg';
import enkeiTrailTrackerImg from '../assets/wheels/ENKEI_Trail-Tracker.jpg';

// OZ RACING 휠
import ozEstremaXtImg from '../assets/wheels/OZRACING_Estrema_XT.jpg';
import ozSuperturismoAeroImg from '../assets/wheels/OZRACING_SuperturismoAero.jpg';
import ozSuperturismoWrcImg from '../assets/wheels/OZRACING_superturismo-wrc.jpg';
import ozUltraleggeraHltImg from '../assets/wheels/OZRACING_ultraleggera-HLT.jpg';

// 휠 에셋 데이터 목록 (사진, 브랜드, 모델명)
export const WHEEL_ASSETS = [
  { id: 1, brand: 'BBS', modelName: 'CH-R', image: bbsChRImg, isFavorite: false },
  { id: 2, brand: 'BBS', modelName: 'CI-R', image: bbsCiRImg, isFavorite: false },
  { id: 3, brand: 'BBS', modelName: 'FI-R', image: bbsFiRImg, isFavorite: false },
  { id: 4, brand: 'BBS', modelName: 'FS', image: bbsFsImg, isFavorite: false },
  { id: 5, brand: 'BBS', modelName: 'LM', image: bbsLmImg, isFavorite: false },
  { id: 6, brand: 'BBS', modelName: 'RG-R', image: bbsRgRImg, isFavorite: false },
  { id: 7, brand: 'BBS', modelName: 'Super RS', image: bbsSuperRsImg, isFavorite: false },
  { id: 8, brand: 'BBS', modelName: 'XR', image: bbsXrImg, isFavorite: false },

  { id: 9, brand: 'RAYS', modelName: 'HOMURA 2x9R', image: rays2x9RImg, isFavorite: false },
  { id: 10, brand: 'RAYS', modelName: 'HOMURA 2x10MD', image: rays2x10MDImg, isFavorite: false },
  { id: 11, brand: 'RAYS', modelName: 'VOLK G025 LTD', image: raysG025LtdImg, isFavorite: false },
  { id: 12, brand: 'RAYS', modelName: 'TE37 GRAVEL III', image: raysTe37Gravel3Img, isFavorite: false },
  { id: 13, brand: 'RAYS', modelName: 'TE37 SAGA SL M-SPEC', image: raysTe37SagaSlMspecImg, isFavorite: false },
  { id: 14, brand: 'RAYS', modelName: 'STRATAGIA VOUGE SE', image: raysVougeSeImg, isFavorite: false },
  { id: 15, brand: 'RAYS', modelName: 'VERSUS VV27S', image: raysVv27SImg, isFavorite: false },
  { id: 16, brand: 'RAYS', modelName: 'VOLK ZE40', image: raysZe40Img, isFavorite: false },

  { id: 17, brand: 'WORK', modelName: 'BRUNNEN', image: workBrunnenImg, isFavorite: false },
  { id: 18, brand: 'WORK', modelName: 'EMOTION CR Kiwami Shigoku', image: workCrShigokuImg, isFavorite: false },
  { id: 19, brand: 'WORK', modelName: 'GNOSIS CVX', image: workCvxImg, isFavorite: false },
  { id: 20, brand: 'WORK', modelName: 'MEISTER RS11', image: workRs11Img, isFavorite: false },
  { id: 21, brand: 'WORK', modelName: 'SCHWERT RXM', image: workRxmImg, isFavorite: false },
  { id: 22, brand: 'WORK', modelName: 'SCHWERT RXS', image: workRxsImg, isFavorite: false },
  { id: 23, brand: 'WORK', modelName: 'STRAHL', image: workStrahlImg, isFavorite: false },
  { id: 24, brand: 'WORK', modelName: 'EMOTION ZR7', image: workZr7Img, isFavorite: false },

  { id: 25, brand: 'ENKEI', modelName: 'GTC02', image: enkeiGtc02Img, isFavorite: false },
  { id: 26, brand: 'ENKEI', modelName: 'NVR5', image: enkeiNvr5Img, isFavorite: false },
  { id: 27, brand: 'ENKEI', modelName: 'PHANTOM', image: enkeiPhantomImg, isFavorite: false },
  { id: 28, brand: 'ENKEI', modelName: 'Quest', image: enkeiQuestImg, isFavorite: false },
  { id: 29, brand: 'ENKEI', modelName: 'RPF1RS', image: enkeiRpf1RsImg, isFavorite: false },
  { id: 30, brand: 'ENKEI', modelName: 'TM7', image: enkeiTm7Img, isFavorite: false },
  { id: 31, brand: 'ENKEI', modelName: 'TMS', image: enkeiTmsImg, isFavorite: false },
  { id: 32, brand: 'ENKEI', modelName: 'Trail-Tracker', image: enkeiTrailTrackerImg, isFavorite: false },

  { id: 33, brand: 'OZ Racing', modelName: 'Estrema XT', image: ozEstremaXtImg, isFavorite: false },
  { id: 34, brand: 'OZ Racing', modelName: 'Superturismo Aero', image: ozSuperturismoAeroImg, isFavorite: false },
  { id: 35, brand: 'OZ Racing', modelName: 'Superturismo WRC', image: ozSuperturismoWrcImg, isFavorite: false },
  { id: 36, brand: 'OZ Racing', modelName: 'Ultraleggera HLT', image: ozUltraleggeraHltImg, isFavorite: false },
];

export const BRANDS = ['ALL', '즐겨찾기', 'BBS', 'RAYS', 'WORK', 'ENKEI', 'OZ Racing'];
