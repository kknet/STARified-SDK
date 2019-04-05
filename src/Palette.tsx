/**
 * palette.js
 *
 * @author Kanoa Siphandon <kanoasiphandon@outlook.com>
 *
 * Color palette - Material Design
 *
 * This color palette comprises primary and accent colors that can be used for illustration or to develop your brand colors.
 * They’ve been designed to work harmoniously with each other.
 * The color palette starts with primary colors and fills in the spectrum to create a complete and usable palette for Android, Web, and iOS.
 * Google suggests using the 500 colors as the primary colors in your app and the other colors as accents colors.
 * Themes enable consistent app styling through surface shades, shadow depth, and ink opacity.
 *
 * Dark text on light backgrounds (opacity)
 *
 * Primary text  87%
 * Secondary text 54%
 * Disabled text, hint text, and icons 38%
 * Dividers 12%
 * Active icon 54%
 * Inactive icon 38%
 *
 * White text on dark backgrounds (opacity)
 *
 * Primary text  100%
 * Secondary text 70%
 * Disabled text, hint text, and icons 50%
 * Dividers 12%
 * Active icon 100%
 * Inactive icon 50%
 *
 * https://material.io/guidelines/style/color.html#color-color-palette
 */

interface IText {
  color: string;
  fontSize: number;
  fontFamily: string;
}
export interface IColor {
  color: string;
}
export class Palette {
  public static bgColor: string = '#ffffff';
  public static bgColorSecondary: string = '#F7F7F7';
  public static bgColorThird: string = '#E8E8E8';
  public static bgColorTransparent: string = 'transparent';
  public static colorPurple: string = '#AA72DB';
  public static colorBlack: string = '#000000';
  public static whiteTextPrimary: string = 'rgba(255,255,255,1)';
  public static whiteTextSecondary: string = 'rgba(255,255,255,0.7)';
  public static whiteTextDisabled: string = 'rgba(255,255,255,0.5)';
  public static darkText: string = '#9B9B9B';
  public static darkTextPrimary: string = 'rgba(0,0,0,0.87)';
  public static darkTextSecondary: string = 'rgba(0,0,0,0.54)';
  public static darkTextDisabled: string = 'rgba(0,0,0,0.38)';
  public static divider: string = 'rgba(0,0,0,0.12)';
  public static darkColor: string = '#4A4A4A';
  public static colorLightBlack: string = '#242424';
  public static colorGray: string = '#D3D3D3';
  public static textMedium14: IText = {
    color: Palette.darkText,
    fontSize: 14,
    fontFamily: 'Mont'
  };
  public static textMedium13: IText = {
    color: Palette.darkText,
    fontSize: 13,
    fontFamily: 'Montserrat-Medium'
  };
  public static textMedium16: IText = {
    color: Palette.darkText,
    fontSize: 16,
    fontFamily: 'Montserrat-Medium'
  };
  public static textMedium17: IText = {
    color: Palette.darkText,
    fontSize: 17,
    fontFamily: 'Montserrat-Medium'
  };
  public static textMedium20: IText = {
    color: Palette.darkText,
    fontSize: 20,
    fontFamily: 'Montserrat-Medium'
  };
  public static textBold17: IText = {
    color: Palette.colorBlack,
    fontSize: 17,
    fontFamily: 'Montserrat-ExtraBold'
  };
  public static textBold20: IText = {
    color: Palette.colorBlack,
    fontSize: 20,
    fontFamily: 'Montserrat-ExtraBold'
  };
  public static textBold18: IText = {
    color: Palette.colorBlack,
    fontSize: 18,
    fontFamily: 'Montserrat-ExtraBold'
  };
  public static tabBarHeight: number = 50;

  public static colorsAlpha: IColor[] = [
    { color: '#F3F1A380' },
    { color: '#F0EA7380' },
    { color: '#D5E14E80' },
    { color: '#BCD66580' },
    { color: '#85CF5380' },
    { color: '#4BAA5680' },
    { color: '#57C18280' },
    { color: '#77CFBE80' },
    { color: '#B8EDF080' },
    { color: '#BDF9FF80' },
    { color: '#99DEFC80' },
    { color: '#76B5EF80' },
    { color: '#6988EF80' },
    { color: '#5763EE80' },
    { color: '#7F4DEE80' },
    { color: '#9754EF80' },
    { color: '#AD65EE80' },
    { color: '#C582ED80' },
    { color: '#D890EB80' },
    { color: '#CC67BE80' },
    { color: '#DC609480' },
    { color: '#E572A480' },
    { color: '#EA8AAB80' },
    { color: '#F1A9BC80' },
    { color: '#F0998780' },
    { color: '#E7755F80' },
    { color: '#E34E4680' },
    { color: '#E0352880' },
    { color: '#E7723180' },
    { color: '#ECAE4480' },
    { color: '#F2CE4B80' },
    { color: '#F9DE7480' },
    { color: '#FAF0BA80' },
    { color: '#FFFFFF80' },
    { color: '#C6C7C880' },
    { color: '#8B8B8C80' },
    { color: '#43444580' },
    { color: '#00000080' }
  ];

  public static colors: IColor[] = [
    { color: '#F3F1A3' },
    { color: '#F0EA73' },
    { color: '#D5E14E' },
    { color: '#BCD665' },
    { color: '#85CF53' },
    { color: '#4BAA56' },
    { color: '#57C182' },
    { color: '#77CFBE' },
    { color: '#B8EDF0' },
    { color: '#BDF9FF' },
    { color: '#99DEFC' },
    { color: '#76B5EF' },
    { color: '#6988EF' },
    { color: '#5763EE' },
    { color: '#7F4DEE' },
    { color: '#9754EF' },
    { color: '#AD65EE' },
    { color: '#C582ED' },
    { color: '#D890EB' },
    { color: '#CC67BE' },
    { color: '#DC6094' },
    { color: '#E572A4' },
    { color: '#EA8AAB' },
    { color: '#F1A9BC' },
    { color: '#F09987' },
    { color: '#E7755F' },
    { color: '#E34E46' },
    { color: '#E03528' },
    { color: '#E77231' },
    { color: '#ECAE44' },
    { color: '#F2CE4B' },
    { color: '#F9DE74' },
    { color: '#FAF0BA' },
    { color: '#FFFFFF' },
    { color: '#C6C7C8' },
    { color: '#8B8B8C' },
    { color: '#434445' },
    { color: '#000000' }
  ];
}
