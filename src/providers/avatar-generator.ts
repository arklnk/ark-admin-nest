/**
 * user avatar generator
 */
export class AvatarGenerator {
  /**
   * generate avataaars url
   */
  generate(): string {
    return (
      `https://avataaars.io/?clotheColor=${this.range(this.clotheColor)}` +
      `&accessoriesType=${this.range(this.accessoriesType)}` +
      `&avatarStyle=${this.range(this.avatarStyle)}` +
      `&clotheType=${this.range(this.clotheType)}` +
      `&eyeType=${this.range(this.eyeType)}` +
      `&eyebrowType=${this.range(this.eyebrowType)}` +
      `&facialHairColor=${this.range(this.facialHairColor)}` +
      `&facialHairType=${this.range(this.facialHairType)}` +
      `&hairColor=${this.range(this.hairColor)}` +
      `&hatColor=${this.range(this.hatColor)}` +
      `&mouthType=${this.range(this.mouthType)}` +
      `&skinColor=${this.range(this.skinColor)}` +
      `&topType=${this.range(this.topType)}`
    );
  }

  private get clotheColor(): string[] {
    return [
      'Black',
      'Blue01',
      'Blue02',
      'Blue03',
      'Gray01',
      'Gray02',
      'Heather',
      'PastelBlue',
      'PastelGreen',
      'PastelOrange',
      'PastelRed',
      'PastelYellow',
      'Pink',
      'Red',
      'White',
    ];
  }

  private get accessoriesType(): string[] {
    return [
      'Blank',
      'Kurt',
      'Prescription01',
      'Prescription02',
      'Round',
      'Sunglasses',
      'Wayfarers',
    ];
  }

  private get avatarStyle(): string[] {
    return ['Circle', 'Transparent'];
  }

  private get clotheType(): string[] {
    return [
      'BlazerShirt',
      'BlazerSweater',
      'CollarSweater',
      'GraphicShirt',
      'Hoodie',
      'Overall',
      'ShirtCrewNeck',
      'ShirtScoopNeck',
      'ShirtVNeck',
    ];
  }

  private get eyeType(): string[] {
    return [
      'Close',
      'Cry',
      'Default',
      'Dizzy',
      'EyeRoll',
      'Happy',
      'Hearts',
      'Side',
      'Squint',
      'Surprised',
      'Wink',
      'WinkWacky',
    ];
  }

  private get eyebrowType(): string[] {
    return [
      'Angry',
      'AngryNatural',
      'Default',
      'DefaultNatural',
      'FlatNatural',
      'RaisedExcited',
      'RaisedExcitedNatural',
      'SadConcerned',
      'SadConcernedNatural',
      'UnibrowNatural',
      'UpDown',
      'UpDownNatural',
    ];
  }

  private get facialHairColor(): string[] {
    return [
      'Auburn',
      'Black',
      'Blonde',
      'BlondeGolden',
      'Brown',
      'BrownDark',
      'Platinum',
      'Red',
    ];
  }

  private get facialHairType(): string[] {
    return [
      'Blank',
      'BeardMedium',
      'BeardLight',
      'BeardMajestic',
      'MoustacheFancy',
      'MoustacheMagnum',
    ];
  }

  private get hairColor(): string[] {
    return [
      'Auburn',
      'Black',
      'Blonde',
      'BlondeGolden',
      'Brown',
      'BrownDark',
      'PastelPink',
      'Blue',
      'Platinum',
      'Red',
      'SilverGray',
    ];
  }

  private get hatColor(): string[] {
    return [
      'Black',
      'Blue01',
      'Blue02',
      'Blue03',
      'Gray01',
      'Gray02',
      'Heather',
      'PastelBlue',
      'PastelGreen',
      'PastelOrange',
      'PastelRed',
      'PastelYellow',
      'Pink',
      'Red',
      'White',
    ];
  }

  private get mouthType(): string[] {
    return [
      'Concerned',
      'Default',
      'Disbelief',
      'Eating',
      'Grimace',
      'Sad',
      'ScreamOpen',
      'Serious',
      'Smile',
      'Tongue',
      'Twinkle',
      'Vomit',
    ];
  }

  private get skinColor(): string[] {
    return ['Tanned', 'Yellow', 'Pale', 'Light', 'Brown', 'DarkBrown', 'Black'];
  }

  private get topType(): string[] {
    return [
      'NoHair',
      'Eyepatch',
      'Hat',
      'Hijab',
      'Turban',
      'WinterHat1',
      'WinterHat2',
      'WinterHat3',
      'WinterHat4',
      'LongHairBigHair',
      'LongHairBob',
      'LongHairBun',
      'LongHairCurly',
      'LongHairCurvy',
      'LongHairDreads',
      'LongHairFrida',
      'LongHairFro',
      'LongHairFroBand',
      'LongHairNotTooLong',
      'LongHairShavedSides',
      'LongHairMiaWallace',
      'LongHairStraight',
      'LongHairStraight2',
      'LongHairStraightStrand',
      'ShortHairDreads01',
      'ShortHairDreads02',
      'ShortHairFrizzle',
      'ShortHairShaggyMullet',
      'ShortHairShortCurly',
      'ShortHairShortFlat',
      'ShortHairShortRound',
      'ShortHairShortWaved',
      'ShortHairSides',
      'ShortHairTheCaesar',
      'ShortHairTheCaesarSidePart',
    ];
  }

  private range<T = string>(values: T[]): T {
    const index = Math.floor(Math.random() * (values.length + 1));
    return values[index];
  }
}
