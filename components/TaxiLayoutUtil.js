import {LayoutProvider} from 'recyclerlistview';
import {Dimensions} from 'react-native';
const SCREEN_WIDTH = Dimensions.get('window').width;

export class TaxiLayoutUtil {
  static getWindowWidth() {
    // To deal with precision issues on android
    return Math.round(Dimensions.get('window').width * 1000) / 1000 - 14; //Adjustment for margin given to RLV;
  }
  static getLayoutProvider(type) {
    switch (type) {
      case 1:
        return new LayoutProvider(
          () => {
            return 'VSEL';
          },
          (type, dim) => {
            switch (type) {
              case 'VSEL':
                dim.width = SCREEN_WIDTH / 2 - 16;
                dim.height = 180;
                break;
              default:
                dim.width = 0;
                dim.height = 0;
            }
          },
        );
      default:
        return new LayoutProvider(
          () => {
            return 'VSEL';
          },
          (type, dim) => {
            switch (type) {
              case 'VSEL':
                dim.width =
                  Math.round(Dimensions.get('window').width * 1000) / 1000 / 2 -
                  6;
                dim.height = 180;
                break;
              default:
                dim.width = 0;
                dim.height = 0;
            }
          },
        );
    }
  }
}
