export default function  getPlanName(id){
        switch(id) {
        case 1:
        return "ECO-1";
        break;
        case 2:
            return "ECO-2";
        break;
        case 3:
            return "ECO-3";
        break;
        case 4:
            return "BRONZE";
        break;
        case 5:
            return "SILVER";
        break;
        case 6:
            return "GOLD";
        break;
        case 7:
            return "PLATINUM";
        break;
        case 8:
            return "DIAMOND";
        break;
        default:
            return "NOT A MEMBER"
        }
        }